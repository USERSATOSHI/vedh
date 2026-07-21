import { marked } from 'marked';
import { readFileSync } from 'node:fs';
import { ok, safeCall } from '@usersatoshi/results';
import type { WikiPage } from '@vedh/types';
import { CoreDatabase } from '../db/index.js';
import type { WikiServiceContract } from './type.js';
export class WikiService implements WikiServiceContract {
  readonly #db: CoreDatabase;
  constructor(database: CoreDatabase) {
    this.#db = database;
  }
  save(page: WikiPage) {
    const result = this.#db.run(
      'INSERT INTO wiki_pages(path, content, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(path) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP',
      [page.path, JSON.stringify(page)],
    );
    return result.isErr() ? result : ok(undefined);
  }
  get(path: string) {
    const result = this.#db.get<PageRow>(
      'SELECT content FROM wiki_pages WHERE path = ?',
      [path],
    );
    if (result.isErr()) return result;
    const page = result.value;
    if (!page) return ok(null);
    const parsed = safeCall(
      () => JSON.parse(page.content) as WikiPage,
      () => ({ kind: -1 as const }),
    );
    return ok(
      parsed.isOk()
        ? parsed.value
        : { path, title: path, summary: '', content: page.content },
    );
  }
  list() {
    const result = this.#db.all<PageRow>(
      'SELECT content FROM wiki_pages ORDER BY path',
    );
    if (result.isErr()) return result;
    return ok(
      result.value
        .map((row) =>
          safeCall(
            () => JSON.parse(row.content) as WikiPage,
            () => ({ kind: -1 as const }),
          ).unwrapOr(undefined),
        )
        .filter((page): page is WikiPage => page !== undefined),
    );
  }
  remove(path: string) {
    const result = this.#db.run('DELETE FROM wiki_pages WHERE path = ?', [
      path,
    ]);
    return result.isErr() ? result : ok(undefined);
  }
  render(markdown: string): string {
    return marked.parse(markdown, { async: false }) as string;
  }
  source(nodeId: string) {
    const result = this.#db.get<NodeRow>(
      'SELECT file_path,line_start,line_end,offset_start,offset_end,metadata_json FROM nodes WHERE id = ?',
      [nodeId],
    );
    if (result.isErr()) return result;
    if (!result.value) return ok(null);
    try {
      const metadata = JSON.parse(result.value.metadata_json || '{}') as {
        source_code?: string;
      };
      if (metadata.source_code) return ok(metadata.source_code);
      const content = readFileSync(result.value.file_path, 'utf8');
      if (
        result.value.offset_start !== null &&
        result.value.offset_end !== null &&
        result.value.offset_start >= 0 &&
        result.value.offset_end >= result.value.offset_start
      )
        return ok(
          content.slice(result.value.offset_start, result.value.offset_end),
        );
      const lines = content.split(/\r?\n/);
      return ok(
        lines
          .slice(result.value.line_start - 1, result.value.line_end)
          .join('\n'),
      );
    } catch {
      return ok(null);
    }
  }
  generate(repoHash: string) {
    const cleared = this.#db.run(
      'DELETE FROM wiki_pages WHERE path IN (SELECT id FROM nodes WHERE repo_hash = ?)',
      [repoHash],
    );
    if (cleared.isErr()) return cleared;
    const nodes = this.#db.all<WikiNodeRow>(
      "SELECT id,name,kind,file_path,line_start,line_end,hierarchy_level,metadata_json FROM nodes WHERE repo_hash = ? AND kind NOT IN ('module','export_statement','event')",
      [repoHash],
    );
    if (nodes.isErr()) return nodes;
    let generated = 0;
    for (const node of nodes.value) {
      let metadata: Record<string, unknown> = {};
      try {
        metadata = JSON.parse(node.metadata_json || '{}') as Record<
          string,
          unknown
        >;
      } catch {
        /* empty metadata */
      }
      const doc =
        typeof metadata.doc === 'string'
          ? this.#cleanDocumentation(metadata.doc)
          : '';
      if (!doc) continue;
      const summary = doc.split(/\r?\n/).find((line) => line.trim()) ?? '';
      const content = [`# ${node.name}`, '', doc].join('\n');
      const saved = this.save({
        path: node.id,
        title: node.name,
        summary,
        content,
      });
      if (saved.isErr()) return saved;
      generated++;
    }
    return ok(generated);
  }
  #cleanDocumentation(value: string): string {
    return value
      .replace(/^\s*\/\*\*?/, '')
      .replace(/\*\/\s*$/, '')
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*\* ?/, '').replace(/^\s*# ?/, ''))
      .join('\n')
      .trim();
  }
}
interface PageRow {
  content: string;
}
interface NodeRow {
  file_path: string;
  line_start: number;
  line_end: number;
  offset_start: number | null;
  offset_end: number | null;
  metadata_json: string;
}
interface WikiNodeRow extends NodeRow {
  id: string;
  name: string;
  kind: string;
  hierarchy_level: string;
}
export type { WikiServiceContract } from './type.js';
