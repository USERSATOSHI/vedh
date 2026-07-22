import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { err, fromAsync, ok } from '@usersatoshi/results';
import {
  ImportResolver,
  type Declaration,
  type ParseResult,
  type ParserEngine,
  type Relation,
} from '@vedh/parser';
import type { EdgeInfo, NodeInfo } from '@vedh/types';
import type { CoreDatabaseError } from '../db/error.js';
import { GraphRepository } from '../repository/index.js';
import {
  IndexerErrorKind,
  type IndexProjectOptions,
  type ProjectIndexerContract,
} from './type.js';
import { toIndexerError } from './error.js';

export const INDEX_SCHEMA_VERSION = '7';

interface ManifestRow {
  file_path: string;
  content_hash: string;
  mtime: number;
}
interface CacheRow {
  file_path: string;
  content_hash: string;
  data: string;
}
interface RepoSnapshotRow {
  schema_version: string;
  commit_hash: string;
}

export class ProjectIndexer implements ProjectIndexerContract {
  readonly #repository: GraphRepository;
  #parser: ParserEngine | undefined;
  readonly #sourceCache = new Map<string, string[]>();
  constructor(repository: GraphRepository, parser?: ParserEngine) {
    this.#repository = repository;
    this.#parser = parser;
  }

  async index(options: IndexProjectOptions) {
    const initialized = this.#repository.initRepo(
      options.repoHash,
      options.url ?? options.projectDir,
      options.name ?? basename(options.projectDir),
    );
    if (initialized.isErr())
      return err(
        toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: initialized.error,
        }),
      );
    const parser = await this.#loadParser();
    if (parser.isErr()) return parser;
    const db = this.#repository.database;
    const manifestResult = db.all<ManifestRow>(
      'SELECT file_path, content_hash, mtime FROM file_manifest WHERE repo_hash = ?',
      [options.repoHash],
    );
    if (manifestResult.isErr())
      return err(
        toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: manifestResult.error,
        }),
      );
    const prior = new Map(
      manifestResult.value.map((row) => [row.file_path, row]),
    );
    const snapshotResult = db.get<RepoSnapshotRow>(
      'SELECT schema_version, commit_hash FROM repos WHERE repo_hash = ?',
      [options.repoHash],
    );
    if (snapshotResult.isErr())
      return err(
        toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: snapshotResult.error,
        }),
      );
    const schemaVersion = options.schemaVersion ?? INDEX_SCHEMA_VERSION;
    const hashes = new Map<string, { hash: string; mtime: number }>();
    options.onProgress?.({
      stage: 'hashing',
      message: `Hashing ${options.files.length} source files...`,
      completed: 0,
      total: options.files.length,
    });
    const hashBatchSize = 64;
    for (
      let offset = 0;
      offset < options.files.length;
      offset += hashBatchSize
    ) {
      const files = options.files.slice(offset, offset + hashBatchSize);
      const batch = await Promise.all(
        files.map(async (filePath) => ({
          filePath,
          result: await this.#hashFile(filePath),
        })),
      );
      for (const hashed of batch) {
        if (hashed.result.isErr()) return hashed.result;
        hashes.set(hashed.filePath, hashed.result.value);
      }
    }
    const deleted = [...prior.keys()].filter((file) => !hashes.has(file));
    const changed = options.files.filter(
      (file) => prior.get(file)?.content_hash !== hashes.get(file)?.hash,
    );
    for (const file of deleted) this.#sourceCache.delete(file);
    const fullRebuild = Boolean(
      options.fullRebuild ||
      !prior.size ||
      snapshotResult.value?.schema_version !== schemaVersion,
    );
    const filesToParse = fullRebuild
      ? [...options.files]
      : [...new Set([...changed])];
    const cached = new Map<string, ParseResult>();
    if (!fullRebuild) {
      const cacheResult = db.all<CacheRow>(
        'SELECT file_path, content_hash, data FROM parse_cache WHERE repo_hash = ?',
        [options.repoHash],
      );
      if (cacheResult.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: cacheResult.error,
          }),
        );
      for (const row of cacheResult.value) {
        if (
          hashes.get(row.file_path)?.hash !== row.content_hash ||
          changed.includes(row.file_path)
        )
          continue;
        try {
          cached.set(row.file_path, JSON.parse(row.data) as ParseResult);
        } catch {
          filesToParse.push(row.file_path);
        }
      }
      for (const file of options.files)
        if (!cached.has(file) && !filesToParse.includes(file))
          filesToParse.push(file);
    }
    const parsedFiles = new Set(filesToParse);
    for (const file of this.#sourceCache.keys())
      if (!parsedFiles.has(file)) this.#sourceCache.delete(file);
    if (options.signal?.aborted)
      return err(toIndexerError(IndexerErrorKind.Aborted, {}));
    options.onProgress?.({
      stage: 'parsing',
      message: `Parsing ${filesToParse.length} file(s); reusing ${cached.size} cached result(s)...`,
      completed: 0,
      total: filesToParse.length,
    });
    const batch = await parser.value.parseFiles(filesToParse, {
      projectRoot: options.projectDir,
      signal: options.signal,
      continueOnError: true,
    });
    if (batch.isErr())
      return err(
        toIndexerError(IndexerErrorKind.ParserFailed, {
          filePath: '<batch>',
          cause: batch.error,
        }),
      );
    const parsed = new Map(cached);
    for (const [file, result] of batch.value.results) parsed.set(file, result);
    for (const file of deleted) parsed.delete(file);

    options.onProgress?.({
      stage: 'writing',
      message: 'Writing declarations and graph state...',
    });
    const began = db.run('BEGIN IMMEDIATE');
    if (began.isErr())
      return err(
        toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: began.error,
        }),
      );
    const rollback = <T>(result: T): T => {
      void db.run('ROLLBACK');
      return result;
    };
    const databaseFailure = (cause: CoreDatabaseError) =>
      rollback(
        err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause,
          }),
        ),
      );
    const clear = this.#clearChanged(
      options.repoHash,
      fullRebuild ? options.files.concat(deleted) : changed.concat(deleted),
      fullRebuild,
    );
    if (clear.isErr()) return rollback(clear);
    const declarationNodes: NodeInfo[] = [];
    for (const file of filesToParse) {
      const result = parsed.get(file);
      if (!result) continue;
      for (const declaration of result.declarations)
        declarationNodes.push(
          this.#node(
            options.repoHash,
            declaration,
            options.sourceInlineMaxLines ?? 40,
          ),
        );
    }
    const declarationsSaved = this.#repository.createNodes(declarationNodes);
    if (declarationsSaved.isErr())
      return databaseFailure(declarationsSaved.error);
    const eventWiki = db.run(
      "DELETE FROM wiki_pages WHERE path IN (SELECT id FROM nodes WHERE repo_hash = ? AND kind = 'event')",
      [options.repoHash],
    );
    if (eventWiki.isErr()) return databaseFailure(eventWiki.error);
    const eventEdges = db.run(
      "DELETE FROM edges WHERE source IN (SELECT id FROM nodes WHERE repo_hash = ? AND kind = 'event') OR target IN (SELECT id FROM nodes WHERE repo_hash = ? AND kind = 'event')",
      [options.repoHash, options.repoHash],
    );
    if (eventEdges.isErr()) return databaseFailure(eventEdges.error);
    const oldEvents = db.run(
      "DELETE FROM nodes WHERE repo_hash = ? AND kind = 'event'",
      [options.repoHash],
    );
    if (oldEvents.isErr()) return databaseFailure(oldEvents.error);
    const nodesResult = this.#repository.getNodes(options.repoHash);
    if (nodesResult.isErr()) return databaseFailure(nodesResult.error);
    const relationClear = db.run(
      "DELETE FROM edges WHERE type != 'contains' AND source IN (SELECT id FROM nodes WHERE repo_hash = ?)",
      [options.repoHash],
    );
    if (relationClear.isErr()) return databaseFailure(relationClear.error);
    options.onProgress?.({
      stage: 'linking',
      message: 'Resolving calls, imports, events, and dependencies...',
    });
    const linked = this.#link(options, parsed, nodesResult.value);
    if (linked.isErr()) return rollback(linked);
    const virtualNodesSaved = this.#repository.createNodes(linked.value.nodes);
    if (virtualNodesSaved.isErr())
      return databaseFailure(virtualNodesSaved.error);
    const edgesSaved = this.#repository.createEdges(linked.value.edges);
    if (edgesSaved.isErr()) return databaseFailure(edgesSaved.error);
    const persisted = this.#persistState(
      options,
      parsed,
      hashes,
      deleted,
      filesToParse,
    );
    if (persisted.isErr()) return rollback(persisted);
    const counts = db.get<{ nodes: number; files: number }>(
      'SELECT (SELECT COUNT(*) FROM nodes WHERE repo_hash = ?) AS nodes, (SELECT COUNT(*) FROM file_manifest WHERE repo_hash = ?) AS files',
      [options.repoHash, options.repoHash],
    );
    if (counts.isErr()) return databaseFailure(counts.error);
    const commitHash =
      options.commitHash ?? this.#gitCommit(options.projectDir);
    const snapshot = this.#repository.updateSnapshot(options.repoHash, {
      commitHash: commitHash ?? undefined,
      nodeCount: counts.value?.nodes ?? 0,
      fileCount: counts.value?.files ?? options.files.length,
      schemaVersion,
    });
    if (snapshot.isErr()) return databaseFailure(snapshot.error);
    const committed = db.run('COMMIT');
    if (committed.isErr()) return databaseFailure(committed.error);
    return ok({
      indexedFiles: filesToParse.length,
      indexedNodes: declarationNodes.length + linked.value.nodes.length,
      indexedEdges: linked.value.edges.length,
      diagnostics: batch.value.diagnostics,
      changedFiles: changed.length,
      deletedFiles: deleted.length,
      cachedFiles: cached.size,
      fullRebuild,
    });
  }

  #clearChanged(repoHash: string, files: readonly string[], full: boolean) {
    const db = this.#repository.database;
    if (full) {
      const wiki = db.run(
        'DELETE FROM wiki_pages WHERE path IN (SELECT id FROM nodes WHERE repo_hash = ?)',
        [repoHash],
      );
      if (wiki.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: wiki.error,
          }),
        );
      const edges = db.run(
        'DELETE FROM edges WHERE source IN (SELECT id FROM nodes WHERE repo_hash = ?) OR target IN (SELECT id FROM nodes WHERE repo_hash = ?)',
        [repoHash, repoHash],
      );
      if (edges.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: edges.error,
          }),
        );
      const nodes = db.run('DELETE FROM nodes WHERE repo_hash = ?', [repoHash]);
      return nodes.isErr()
        ? err(
            toIndexerError(IndexerErrorKind.DatabaseFailed, {
              cause: nodes.error,
            }),
          )
        : ok(undefined);
    }
    for (const file of files) {
      const wiki = db.run(
        'DELETE FROM wiki_pages WHERE path IN (SELECT id FROM nodes WHERE repo_hash = ? AND file_path = ?)',
        [repoHash, file],
      );
      if (wiki.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: wiki.error,
          }),
        );
      const edges = db.run(
        'DELETE FROM edges WHERE source IN (SELECT id FROM nodes WHERE repo_hash = ? AND file_path = ?) OR target IN (SELECT id FROM nodes WHERE repo_hash = ? AND file_path = ?)',
        [repoHash, file, repoHash, file],
      );
      if (edges.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: edges.error,
          }),
        );
      const nodes = db.run(
        'DELETE FROM nodes WHERE repo_hash = ? AND file_path = ?',
        [repoHash, file],
      );
      if (nodes.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: nodes.error,
          }),
        );
    }
    return ok(undefined);
  }

  #link(
    options: IndexProjectOptions,
    parsed: Map<string, ParseResult>,
    existing: NodeInfo[],
  ) {
    const nodes = [...existing];
    const virtualNodes = new Map<string, NodeInfo>();
    const byFile = new Map<string, NodeInfo[]>();
    const byName = new Map<string, NodeInfo[]>();
    for (const node of nodes) {
      const file = byFile.get(node.file_path) ?? [];
      file.push(node);
      byFile.set(node.file_path, file);
      const named = byName.get(node.name) ?? [];
      named.push(node);
      byName.set(node.name, named);
    }
    const resolver = new ImportResolver({
      projectRoot: options.projectDir,
      workspacePackages: options.workspacePackages,
    });
    const edgeSites = new Map<
      string,
      { edge: EdgeInfo; sites: Record<string, unknown>[] }
    >();
    const add = (
      source: NodeInfo,
      target: NodeInfo,
      type: string,
      relation: Relation,
      extra: Record<string, unknown> = {},
    ) => {
      const key = `${source.id}\0${target.id}\0${type}`;
      const site = {
        file: relation.filePath,
        line: relation.range.start.line,
        column: relation.range.start.column,
        columnStart: relation.range.start.column,
        columnEnd: relation.range.end.column,
        offsetStart: relation.range.start.offset,
        offsetEnd: relation.range.end.offset,
        ...extra,
      };
      const value = edgeSites.get(key) ?? {
        edge: { source: source.id, target: target.id, type, weight: 0 },
        sites: [],
      };
      value.edge.weight += 1;
      value.sites.push(site);
      edgeSites.set(key, value);
    };
    for (const result of parsed.values()) {
      const local = byFile.get(result.filePath) ?? [];
      const imports = new Map<string, NodeInfo>();
      for (const relation of result.relations)
        if (relation.kind === 'import') {
          const resolved = resolver.resolveToSymbol({
            specifier: relation.module,
            importedName: relation.specifier,
            importerPath: result.filePath,
            projectRoot: options.projectDir,
            workspacePackages: options.workspacePackages,
          });
          if (resolved.isOk() && resolved.value) {
            const target =
              (byFile.get(resolved.value.filePath) ?? []).find(
                (node) => node.name === resolved.value!.symbolName,
              ) ??
              (byFile.get(resolved.value.filePath) ?? []).find(
                (node) => node.kind === 'module',
              );
            if (target && relation.specifier)
              imports.set(relation.specifier, target);
          }
        }
      for (const relation of result.relations) {
        const source = this.#closest(local, relation.range.start.line);
        if (!source) continue;
        if (relation.kind === 'event') {
          const id = `event:${options.repoHash}:${relation.eventName}`;
          let eventNode = virtualNodes.get(id);
          if (!eventNode) {
            eventNode = {
              id,
              name: relation.eventName,
              kind: 'event',
              file_path: '<events>',
              line_start: 0,
              line_end: 0,
              repo_hash: options.repoHash,
              parent_id: null,
              hierarchy_level: 'low',
              metadata: { eventKind: relation.eventKind ?? 'event' },
            };
            virtualNodes.set(id, eventNode);
          }
          if (relation.direction === 'fire')
            add(source, eventNode, 'fires_hook', relation, {
              eventKind: relation.eventKind,
            });
          else {
            const callback = relation.callback?.name
              ? ((byName.get(relation.callback.name) ?? []).find(
                  (node) => node.file_path === result.filePath,
                ) ?? byName.get(relation.callback.name)?.[0])
              : undefined;
            add(source, eventNode, 'listens_hook', relation, {
              callback: relation.callback?.name,
              priority: relation.priority,
              acceptedArguments: relation.acceptedArguments,
            });
            if (callback)
              add(eventNode, callback, 'dispatches', relation, {
                priority: relation.priority,
                acceptedArguments: relation.acceptedArguments,
              });
          }
          continue;
        }
        let target: NodeInfo | undefined;
        if (relation.kind === 'import') {
          const resolved = resolver.resolveToSymbol({
            specifier: relation.module,
            importedName: relation.specifier,
            importerPath: result.filePath,
            projectRoot: options.projectDir,
            workspacePackages: options.workspacePackages,
          });
          if (resolved.isOk() && resolved.value)
            target =
              (byFile.get(resolved.value.filePath) ?? []).find(
                (node) => node.name === resolved.value!.symbolName,
              ) ??
              (byFile.get(resolved.value.filePath) ?? []).find(
                (node) => node.kind === 'module',
              );
        } else {
          const name =
            relation.kind === 'export' ? relation.target : relation.target;
          target =
            local.find((node) => node.name === name) ?? imports.get(name);
          if (!target && relation.kind === 'reference' && relation.receiver) {
            const receiver = relation.receiver.replace(
              /^this\.|^self\.|^\$this->|^\$/,
              '',
            );
            const owner =
              receiver === 'this' || receiver === 'self'
                ? nodes.find((node) => node.id === source.parent_id)
                : (byName.get(receiver) ?? [])[0];
            target = owner
              ? nodes.find(
                  (node) => node.parent_id === owner.id && node.name === name,
                )
              : undefined;
          }
          if (!target) {
            const matches = byName.get(name) ?? [];
            if (matches.length === 1) target = matches[0];
          }
        }
        if (!target) continue;
        const type =
          relation.kind === 'reference'
            ? relation.role === 'call'
              ? 'calls'
              : relation.role
            : relation.kind;
        add(
          source,
          target,
          type,
          relation,
          relation.kind === 'reference' ? { receiver: relation.receiver } : {},
        );
      }
    }
    const edges = [...edgeSites.values()].map(({ edge, sites }) => ({
      ...edge,
      metadata_json: JSON.stringify({ call_sites: sites, call_site: sites[0] }),
    }));
    return ok({ nodes: [...virtualNodes.values()], edges });
  }

  #persistState(
    options: IndexProjectOptions,
    parsed: Map<string, ParseResult>,
    hashes: Map<string, { hash: string; mtime: number }>,
    deleted: readonly string[],
    filesToPersist: readonly string[],
  ) {
    const db = this.#repository.database;
    if (deleted.length > 0) {
      const placeholders = deleted.map(() => '?').join(',');
      const manifest = db.run(
        `DELETE FROM file_manifest WHERE repo_hash = ? AND file_path IN (${placeholders})`,
        [options.repoHash, ...deleted],
      );
      if (manifest.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: manifest.error,
          }),
        );
      const cache = db.run(
        `DELETE FROM parse_cache WHERE repo_hash = ? AND file_path IN (${placeholders})`,
        [options.repoHash, ...deleted],
      );
      if (cache.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: cache.error,
          }),
        );
    }
    const files = [...new Set(filesToPersist)];
    const manifestChunkSize = 1_000;
    for (let offset = 0; offset < files.length; offset += manifestChunkSize) {
      const chunk = files.slice(offset, offset + manifestChunkSize);
      const placeholders = chunk.map(() => '(?,?,?,?)').join(',');
      const parameters = chunk.flatMap((file) => {
        const value = hashes.get(file)!;
        return [file, options.repoHash, value.hash, value.mtime];
      });
      const manifest = db.run(
        `INSERT OR REPLACE INTO file_manifest(file_path, repo_hash, content_hash, mtime) VALUES ${placeholders}`,
        parameters,
      );
      if (manifest.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: manifest.error,
          }),
        );
    }
    const cacheRows = files.flatMap((file) => {
      const result = parsed.get(file);
      const value = hashes.get(file);
      return result && value
        ? [[file, options.repoHash, value.hash, JSON.stringify(result)]]
        : [];
    });
    const cacheChunkSize = 500;
    for (let offset = 0; offset < cacheRows.length; offset += cacheChunkSize) {
      const chunk = cacheRows.slice(offset, offset + cacheChunkSize);
      const placeholders = chunk.map(() => '(?,?,?,?)').join(',');
      const cache = db.run(
        `INSERT OR REPLACE INTO parse_cache(file_path, repo_hash, content_hash, data) VALUES ${placeholders}`,
        chunk.flat(),
      );
      if (cache.isErr())
        return err(
          toIndexerError(IndexerErrorKind.DatabaseFailed, {
            cause: cache.error,
          }),
        );
    }
    return ok(undefined);
  }

  #node(
    repoHash: string,
    declaration: Declaration,
    inlineLimit: number,
  ): NodeInfo {
    const lines = this.#sourceCache.get(declaration.filePath) ?? [];
    const count = declaration.range.end.line - declaration.range.start.line + 1;
    const source =
      count <= inlineLimit
        ? lines
            .slice(declaration.range.start.line - 1, declaration.range.end.line)
            .join('\n')
        : '';
    const leading = lines
      .slice(
        Math.max(0, declaration.range.start.line - 8),
        declaration.range.start.line - 1,
      )
      .join('\n');
    const blockMatches = [...leading.matchAll(/\/\*\*[\s\S]*?\*\//g)];
    const lastBlock = blockMatches.at(-1);
    const blockDoc =
      lastBlock &&
      leading.slice((lastBlock.index ?? 0) + lastBlock[0].length).trim() === ''
        ? lastBlock[0]
        : '';
    const lineDoc = /\.py$/i.test(declaration.filePath)
      ? (leading.match(/(?:^|\n)(?:\s*#.*\n?)+$/)?.[0]?.trim() ?? '')
      : '';
    const doc = blockDoc || lineDoc;
    return {
      id: declaration.id,
      name: declaration.name,
      kind: declaration.kind,
      file_path: declaration.filePath,
      line_start: declaration.range.start.line,
      line_end: declaration.range.end.line,
      column_start: declaration.range.start.column,
      column_end: declaration.range.end.column,
      offset_start: declaration.range.start.offset,
      offset_end: declaration.range.end.offset,
      repo_hash: repoHash,
      parent_id: declaration.parentId,
      hierarchy_level: 'low',
      metadata: {
        ...declaration.metadata,
        depth: declaration.depth,
        source_code: source,
        doc,
        summary:
          doc.replace(/^[\s/*#-]+|[\s/*#-]+$/g, '').split(/\r?\n/)[0] ?? '',
      },
    };
  }

  #closest(nodes: NodeInfo[], line: number): NodeInfo | undefined {
    return nodes
      .filter((node) => node.line_start <= line && node.line_end >= line)
      .sort(
        (a, b) => a.line_end - a.line_start - (b.line_end - b.line_start),
      )[0];
  }

  async #hashFile(filePath: string) {
    return fromAsync(
      async () => {
        const [content, info] = await Promise.all([
          readFile(filePath),
          stat(filePath),
        ]);
        this.#sourceCache.set(
          filePath,
          content.toString('utf8').split(/\r?\n/),
        );
        return {
          hash: createHash('sha256').update(content).digest('hex'),
          mtime: Math.floor(info.mtimeMs),
        };
      },
      (cause) =>
        toIndexerError(IndexerErrorKind.ParserFailed, { filePath, cause }),
    );
  }

  #gitCommit(projectDir: string): string | null {
    const result = spawnSync('git', ['-C', projectDir, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    });
    return result.status === 0 ? result.stdout.trim() : null;
  }

  async #loadParser() {
    if (this.#parser) return ok(this.#parser);
    return fromAsync(
      async () => {
        const { ParserEngine } = await import('@vedh/parser');
        this.#parser = new ParserEngine();
        return this.#parser;
      },
      (cause) =>
        toIndexerError(IndexerErrorKind.ParserFailed, {
          filePath: '<engine>',
          cause,
        }),
    );
  }
}

export { toIndexerErr, toIndexerError } from './error.js';
export { IndexerErrorKind } from './type.js';
export type {
  IndexerError,
  IndexProjectOptions,
  IndexProjectResult,
  ProjectIndexerContract,
} from './type.js';
