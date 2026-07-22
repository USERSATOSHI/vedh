import type { NodeInfo } from '@vedh/types';
import { CoreDatabase } from '../db/index.js';
import { GraphRepository } from '../repository/index.js';
import { SearchService } from '../search/index.js';
import { WikiService } from '../wiki/index.js';

export interface KnowledgeAnswer {
  answer: string;
  sources: Array<{ id: string; name: string; filePath: string }>;
  usedLlm: boolean;
}
export interface EnrichmentOptions {
  generateMissingDocs?: boolean;
  importsExportsOnly?: boolean;
  concurrency?: number;
}

export class KnowledgeService {
  readonly #db: CoreDatabase;
  constructor(database: CoreDatabase) {
    this.#db = database;
  }

  async answer(repoHash: string, question: string): Promise<KnowledgeAnswer> {
    const search = new SearchService(this.#db).search(repoHash, question);
    if (search.isErr())
      return {
        answer: `Search failed: ${String(search.error)}`,
        sources: [],
        usedLlm: false,
      };
    const repository = new GraphRepository(this.#db);
    const wiki = new WikiService(this.#db);
    const candidates: Array<{ node: NodeInfo; source: string }> = [];
    for (const item of search.value.slice(0, 8)) {
      const node = repository.getNode(item.id);
      if (node.isErr() || !node.value) continue;
      const source = wiki.source(item.id);
      candidates.push({
        node: node.value,
        source: source.isOk() ? (source.value ?? '') : '',
      });
    }
    const sources = candidates.map(({ node }) => ({
      id: node.id,
      name: node.name,
      filePath: node.file_path,
    }));
    if (!candidates.length)
      return {
        answer: 'No matching symbols were found.',
        sources,
        usedLlm: false,
      };
    const context = candidates
      .map(
        ({ node, source }) =>
          `## ${node.name} (${node.kind})\n${node.file_path}:${node.line_start}-${node.line_end}\n${String(node.metadata.summary ?? '')}\n\`\`\`\n${source.slice(0, 3000)}\n\`\`\``,
      )
      .join('\n\n');
    const llm = await this.#llm(
      `Answer the codebase question using only the supplied symbols. Cite symbol names and file paths.\n\nQuestion: ${question}\n\n${context}`,
    );
    if (llm) return { answer: llm, sources, usedLlm: true };
    return {
      answer: candidates
        .map(
          ({ node }) =>
            `${node.name} (${node.kind}) — ${node.file_path}:${node.line_start}`,
        )
        .join('\n'),
      sources,
      usedLlm: false,
    };
  }

  async concept(
    repoHash: string,
    nodeIds: readonly string[],
    question = 'Explain how these symbols fit together.',
  ): Promise<KnowledgeAnswer> {
    const repository = new GraphRepository(this.#db);
    const wiki = new WikiService(this.#db);
    const candidates = nodeIds.flatMap((id) => {
      const node = repository.getNode(id);
      if (node.isErr() || !node.value) return [];
      const source = wiki.source(id);
      return [
        { node: node.value, source: source.isOk() ? (source.value ?? '') : '' },
      ];
    });
    const sources = candidates.map(({ node }) => ({
      id: node.id,
      name: node.name,
      filePath: node.file_path,
    }));
    const prompt = `${question}\n\n${candidates.map(({ node, source }) => `${node.name} ${node.file_path}\n${source}`).join('\n\n')}`;
    const answer = await this.#llm(prompt);
    return {
      answer:
        answer ??
        sources
          .map((source) => `${source.name}: ${source.filePath}`)
          .join('\n'),
      sources,
      usedLlm: Boolean(answer),
    };
  }

  async enrich(
    repoHash: string,
    options: EnrichmentOptions = {},
  ): Promise<number> {
    if (!(process.env.VEDH_LLM_URL ?? process.env.OPENAI_BASE_URL)) return 0;
    const rows = this.#db.all<{
      id: string;
      name: string;
      kind: string;
      file_path: string;
      metadata_json: string;
    }>(
      `SELECT id,name,kind,file_path,metadata_json FROM nodes WHERE repo_hash=? ${options.importsExportsOnly ? "AND kind IN ('module','export_statement')" : "AND kind!='event'"}`,
      [repoHash],
    );
    if (rows.isErr()) return 0;
    const wiki = new WikiService(this.#db);
    let cursor = 0;
    let enriched = 0;
    const worker = async () => {
      for (;;) {
        const index = cursor++;
        if (index >= rows.value.length) return;
        const row = rows.value[index]!;
        let metadata: Record<string, unknown> = {};
        try {
          metadata = JSON.parse(row.metadata_json || '{}') as Record<
            string,
            unknown
          >;
        } catch {
          /* empty */
        }
        const sourceResult = wiki.source(row.id);
        const source = sourceResult.isOk() ? (sourceResult.value ?? '') : '';
        if (!source) continue;
        const answer = await this.#llm(
          `Summarize this ${row.kind} in one precise sentence. Describe behavior, not syntax.\n\n${source.slice(0, 8000)}`,
        );
        if (!answer) continue;
        metadata.summary = answer;
        if (options.generateMissingDocs && !metadata.doc)
          metadata.generated_doc =
            (await this.#llm(
              `Write a concise documentation comment for this ${row.kind}. Return only the comment text.\n\n${source.slice(0, 8000)}`,
            )) ?? '';
        const updated = this.#db.run(
          'UPDATE nodes SET metadata_json=? WHERE id=?',
          [JSON.stringify(metadata), row.id],
        );
        if (updated.isOk()) enriched++;
      }
    };
    await Promise.all(
      Array.from({ length: Math.max(1, options.concurrency ?? 4) }, worker),
    );
    return enriched;
  }

  async #llm(prompt: string): Promise<string | null> {
    const base = process.env.VEDH_LLM_URL ?? process.env.OPENAI_BASE_URL;
    if (!base) return null;
    const endpoint = base.endsWith('/chat/completions')
      ? base
      : `${base.replace(/\/$/, '')}/chat/completions`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.OPENAI_API_KEY
            ? { authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({
          model:
            process.env.VEDH_LLM_MODEL ??
            process.env.OPENAI_MODEL ??
            'gpt-4.1-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });
      if (!response.ok) return null;
      const body = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return body.choices?.[0]?.message?.content?.trim() || null;
    } catch {
      return null;
    }
  }
}
