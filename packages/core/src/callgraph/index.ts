import { ok, safeCall, type Result } from '@usersatoshi/results';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import type { EdgeInfo, NodeInfo } from '@vedh/types';
import { CoreDatabase } from '../db/index.js';
import type { CoreDatabaseError } from '../db/error.js';
import type {
  CallChain,
  CallChainNode,
  CallGraphServiceContract,
  CallSite,
  EntryNode,
  ExecutionFlow,
} from './type.js';

interface NodeRow extends Omit<NodeInfo, 'metadata'> {
  metadata_json: string;
}

export class CallGraphService implements CallGraphServiceContract {
  readonly #db: CoreDatabase;
  constructor(database: CoreDatabase) {
    this.#db = database;
  }

  chain(nodeId: string, maxDepth = 3): Result<CallChain, CoreDatabaseError> {
    const root = this.#node(nodeId);
    if (root.isErr()) return root;
    const callers: CallChainNode[] = [];
    const callees: CallChainNode[] = [];
    const edgeMap = new Map<string, EdgeInfo>();
    const walk = (
      id: string,
      depth: number,
      direction: 'caller' | 'callee',
      visited: Set<string>,
    ): Result<void, CoreDatabaseError> => {
      if (depth >= maxDepth || visited.has(id)) return ok(undefined);
      visited.add(id);
      const edges = this.#db.all<EdgeInfo>(
        direction === 'caller'
          ? `SELECT * FROM edges WHERE target = ? AND type IN ('calls','constructor','fires_hook','dispatches')`
          : `SELECT * FROM edges WHERE source = ? AND type IN ('calls','constructor','fires_hook','dispatches')`,
        [id],
      );
      if (edges.isErr()) return edges;
      for (const edge of edges.value) {
        edgeMap.set(`${edge.source}\0${edge.target}\0${edge.type}`, edge);
        const next = direction === 'caller' ? edge.source : edge.target;
        if (visited.has(next)) continue;
        const node = this.#node(next);
        if (node.isErr()) return node;
        if (node.value)
          (direction === 'caller' ? callers : callees).push({
            node: node.value,
            depth: depth + 1,
            direction,
            callSites: this.#sites(edge),
          });
        const nested = walk(next, depth + 1, direction, visited);
        if (nested.isErr()) return nested;
      }
      return ok(undefined);
    };
    const incoming = walk(nodeId, 0, 'caller', new Set());
    if (incoming.isErr()) return incoming;
    const outgoing = walk(nodeId, 0, 'callee', new Set());
    if (outgoing.isErr()) return outgoing;
    return ok({
      root: root.value,
      callers,
      callees,
      edges: [...edgeMap.values()],
    } satisfies CallChain);
  }

  entryNodes(repoHash: string) {
    const manifestFiles = this.#manifestEntryFiles(repoHash);
    if (manifestFiles.length) {
      const placeholders = manifestFiles.map(() => '?').join(',');
      const manifestEntries = this.#db.all<NodeRow>(
        `SELECT n.* FROM nodes n
         WHERE n.repo_hash = ? AND n.file_path IN (${placeholders}) AND (
           (n.parent_id IS NULL AND (
             n.kind LIKE '%function%' OR n.kind LIKE '%class%' OR n.kind = 'variable_declarator'
           )) OR (
             n.kind = 'module' AND NOT EXISTS (
               SELECT 1 FROM nodes executable
               WHERE executable.repo_hash = n.repo_hash AND executable.file_path = n.file_path
                 AND executable.parent_id IS NULL AND (
                   executable.kind LIKE '%function%' OR executable.kind LIKE '%class%' OR executable.kind = 'variable_declarator'
                 )
             )
           )
         )
         ORDER BY n.hierarchy_level = 'god' DESC, n.file_path, n.line_start LIMIT 40`,
        [repoHash, ...manifestFiles],
      );
      if (manifestEntries.isErr()) return manifestEntries;
      if (manifestEntries.value.length)
        return ok(
          manifestEntries.value.map(
            (row) =>
              ({
                node: this.#map(row),
                reason: 'package-entry',
              }) satisfies EntryNode,
          ),
        );
    }
    const conventional = this.#db.all<NodeRow>(
      `SELECT n.* FROM nodes n WHERE n.repo_hash = ? AND n.kind != 'module' AND n.parent_id IS NULL AND
      (lower(n.file_path) GLOB '*main.*' OR lower(n.file_path) GLOB '*index.*' OR lower(n.file_path) GLOB '*server.*' OR lower(n.file_path) GLOB '*app.*')
      ORDER BY n.hierarchy_level = 'god' DESC, n.line_start LIMIT 20`,
      [repoHash],
    );
    if (conventional.isErr()) return conventional;
    if (conventional.value.length)
      return ok(
        conventional.value.map(
          (row) =>
            ({
              node: this.#map(row),
              reason: 'entry-file',
            }) satisfies EntryNode,
        ),
      );
    const roots = this.#db.all<NodeRow>(
      `SELECT n.* FROM nodes n WHERE n.repo_hash = ? AND n.kind != 'module' AND n.parent_id IS NULL AND n.hierarchy_level IN ('god','high') AND
      NOT EXISTS (SELECT 1 FROM edges e WHERE e.target = n.id AND e.type IN ('calls','constructor','fires_hook','dispatches')) ORDER BY n.hierarchy_level = 'god' DESC, n.file_path LIMIT 20`,
      [repoHash],
    );
    if (roots.isErr()) return roots;
    return ok(
      roots.value.map(
        (row) =>
          ({ node: this.#map(row), reason: 'no-callers' }) satisfies EntryNode,
      ),
    );
  }

  flow(repoHash: string, maxDepth = 5) {
    const entries = this.entryNodes(repoHash);
    if (entries.isErr()) return entries;
    const visited = new Set<string>();
    const flow: ExecutionFlow['flow'] = [];
    const edgeMap = new Map<string, EdgeInfo>();
    const queue: Array<{ id: string; depth: number; parentId?: string }> = [];
    for (const entry of entries.value) {
      visited.add(entry.node.id);
      flow.push({ node: entry.node, depth: 0, callSites: [] });
      queue.push({ id: entry.node.id, depth: 0 });
    }
    for (let head = 0; head < queue.length && visited.size < 2000; head += 1) {
      const current = queue[head]!;
      if (current.depth >= maxDepth) continue;
      const edges = this.#db.all<EdgeInfo>(
        `SELECT * FROM edges WHERE source = ? AND type IN ('calls','constructor','fires_hook','dispatches')`,
        [current.id],
      );
      if (edges.isErr()) return edges;
      for (const edge of edges.value) {
        edgeMap.set(`${edge.source}\0${edge.target}\0${edge.type}`, edge);
        if (visited.has(edge.target)) continue;
        const node = this.#node(edge.target);
        if (node.isErr()) return node;
        if (!node.value) continue;
        visited.add(edge.target);
        flow.push({
          node: node.value,
          depth: current.depth + 1,
          parentId: current.id,
          callSites: this.#sites(edge),
        });
        queue.push({
          id: edge.target,
          depth: current.depth + 1,
          parentId: current.id,
        });
      }
    }
    return ok({
      entries: entries.value,
      flow,
      edges: [...edgeMap.values()],
    } satisfies ExecutionFlow);
  }

  #node(id: string) {
    const row = this.#db.get<NodeRow>('SELECT * FROM nodes WHERE id = ?', [id]);
    return row.isErr() ? row : ok(row.value ? this.#map(row.value) : null);
  }
  #manifestEntryFiles(repoHash: string): string[] {
    const repo = this.#db.get<{ url: string }>(
      'SELECT url FROM repos WHERE repo_hash = ? LIMIT 1',
      [repoHash],
    );
    if (repo.isErr() || !repo.value?.url || !existsSync(repo.value.url))
      return [];
    const root = repo.value.url;
    const rootManifest = this.#readManifest(join(root, 'package.json'));
    if (!rootManifest) return [];
    const manifests = [{ directory: root, value: rootManifest }];
    const workspacePatterns = Array.isArray(rootManifest.workspaces)
      ? rootManifest.workspaces
      : rootManifest.workspaces &&
          typeof rootManifest.workspaces === 'object' &&
          Array.isArray(rootManifest.workspaces.packages)
        ? rootManifest.workspaces.packages
        : [];
    for (const pattern of workspacePatterns) {
      if (typeof pattern !== 'string') continue;
      for (const directory of this.#expandWorkspace(root, pattern)) {
        const value = this.#readManifest(join(directory, 'package.json'));
        if (value) manifests.push({ directory, value });
      }
    }
    const indexedFiles = this.#db.all<{ file_path: string }>(
      'SELECT DISTINCT file_path FROM nodes WHERE repo_hash = ?',
      [repoHash],
    );
    if (indexedFiles.isErr()) return [];
    const known = new Set(indexedFiles.value.map((row) => row.file_path));
    const entries = new Set<string>();
    for (const manifest of manifests) {
      const values = [
        ...this.#manifestStrings(manifest.value.main),
        ...this.#manifestStrings(manifest.value.module),
        ...this.#manifestStrings(manifest.value.bin),
        ...this.#manifestStrings(manifest.value.exports),
      ];
      const start = manifest.value.scripts?.start;
      if (typeof start === 'string')
        values.push(
          ...start
            .split(/\s+/)
            .filter((part) => /^(?:\.\/)?[\w@/-]+\.[cm]?[jt]sx?$/.test(part)),
        );
      for (const value of values) {
        for (const candidate of this.#entryCandidates(
          manifest.directory,
          value,
        )) {
          if (known.has(candidate)) entries.add(candidate);
        }
      }
    }
    return [...entries];
  }
  #readManifest(path: string): PackageManifest | null {
    if (!existsSync(path)) return null;
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as PackageManifest;
    } catch {
      return null;
    }
  }
  #expandWorkspace(root: string, pattern: string): string[] {
    const segments = pattern.replaceAll('\\', '/').split('/').filter(Boolean);
    let directories = [root];
    for (const segment of segments) {
      const next: string[] = [];
      for (const directory of directories) {
        if (segment === '*') {
          if (!existsSync(directory)) continue;
          for (const entry of readdirSync(directory, { withFileTypes: true }))
            if (entry.isDirectory()) next.push(join(directory, entry.name));
        } else if (!segment.includes('*')) {
          next.push(join(directory, segment));
        }
      }
      directories = next;
    }
    return directories;
  }
  #manifestStrings(value: unknown): string[] {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value))
      return value.flatMap((item) => this.#manifestStrings(item));
    if (!value || typeof value !== 'object') return [];
    return Object.values(value).flatMap((item) => this.#manifestStrings(item));
  }
  #entryCandidates(directory: string, value: string): string[] {
    const clean = value.replace(/^\.\//, '').split('#')[0]!;
    const exact = resolve(directory, clean);
    const extension = extname(exact);
    const stem = extension ? exact.slice(0, -extension.length) : exact;
    const candidates = new Set([exact]);
    for (const suffix of ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'])
      candidates.add(`${stem}${suffix}`);
    if (clean.startsWith('dist/')) {
      const sourceStem = resolve(directory, 'src', clean.slice(5));
      const sourceExtension = extname(sourceStem);
      const withoutExtension = sourceExtension
        ? sourceStem.slice(0, -sourceExtension.length)
        : sourceStem;
      for (const suffix of ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'])
        candidates.add(`${withoutExtension}${suffix}`);
    }
    if (!extension)
      for (const suffix of ['index.ts', 'index.tsx', 'index.js', 'index.jsx'])
        candidates.add(join(exact, suffix));
    return [...candidates];
  }
  #map(row: NodeRow): NodeInfo {
    const parsed = safeCall(
      () => JSON.parse(row.metadata_json) as Record<string, unknown>,
      () => ({ kind: -1 as const }),
    );
    const node: Omit<NodeRow, 'metadata_json'> & { metadata_json?: string } = {
      ...row,
    };
    delete node.metadata_json;
    return { ...node, metadata: parsed.isOk() ? parsed.value : {} };
  }
  #sites(edge: EdgeInfo): CallSite[] {
    try {
      const metadata = JSON.parse(edge.metadata_json ?? '{}') as {
        call_sites?: CallSite[];
        call_site?: CallSite;
      };
      return metadata.call_sites?.length
        ? metadata.call_sites
        : metadata.call_site
          ? [metadata.call_site]
          : [];
    } catch {
      return [];
    }
  }
}

interface PackageManifest {
  main?: unknown;
  module?: unknown;
  bin?: unknown;
  exports?: unknown;
  scripts?: { start?: unknown };
  workspaces?: unknown[] | { packages?: unknown[] };
}

export type {
  CallChain,
  CallChainNode,
  CallGraphServiceContract,
  CallSite,
  EntryNode,
  ExecutionFlow,
  ExecutionNode,
} from './type.js';
