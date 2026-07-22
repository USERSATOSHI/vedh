import { ok } from '@usersatoshi/results';
import type { CentralityResult, CommunityInfo } from '@vedh/types';
import { CoreDatabase } from '../db/index.js';
import { computeLouvain } from './louvain.js';
import type {
  AnalysisServiceContract,
  CommunityMember,
  CrossCommunityEdge,
  DomainGroup,
} from './type.js';

export class AnalysisService implements AnalysisServiceContract {
  readonly #db: CoreDatabase;
  constructor(database: CoreDatabase) {
    this.#db = database;
  }
  centrality() {
    const out = this.#db.all<CountRow>(
      'SELECT source AS id, COUNT(*) AS count FROM edges GROUP BY source',
    );
    if (out.isErr()) return out;
    const incoming = this.#db.all<CountRow>(
      'SELECT target AS id, COUNT(*) AS count FROM edges GROUP BY target',
    );
    if (incoming.isErr()) return incoming;
    const values = new Map<string, CentralityResult>();
    for (const row of out.value)
      values.set(row.id, {
        nodeId: row.id,
        degree: Number(row.count),
        inDegree: 0,
        outDegree: Number(row.count),
      });
    for (const row of incoming.value) {
      const prior = values.get(row.id) ?? {
        nodeId: row.id,
        degree: 0,
        inDegree: 0,
        outDegree: 0,
      };
      values.set(row.id, {
        ...prior,
        inDegree: Number(row.count),
        degree: prior.degree + Number(row.count),
      });
    }
    return ok(values);
  }
  detectHierarchy() {
    const values = this.centrality();
    if (values.isErr()) return values;
    const degrees = [...values.value.values()]
      .map((item) => item.degree)
      .filter(Boolean)
      .sort((a, b) => a - b);
    if (!degrees.length) return ok(undefined);
    const at = (p: number) =>
      degrees[Math.max(0, Math.ceil((p / 100) * degrees.length) - 1)]!;
    const levels = { god: at(95), high: at(80), mid: at(50) };
    const begun = this.#db.run('BEGIN IMMEDIATE');
    if (begun.isErr()) return begun;
    for (const [id, value] of values.value) {
      const level =
        value.degree > levels.god
          ? 'god'
          : value.degree > levels.high
            ? 'high'
            : value.degree > levels.mid
              ? 'mid'
              : 'low';
      const result = this.#db.run(
        'UPDATE nodes SET hierarchy_level = ? WHERE id = ?',
        [level, id],
      );
      if (result.isErr()) {
        void this.#db.run('ROLLBACK');
        return result;
      }
    }
    const committed = this.#db.run('COMMIT');
    return committed.isErr() ? committed : ok(undefined);
  }
  godNodes(repoHash?: string) {
    const result = this.#db.all<IdRow>(
      repoHash
        ? "SELECT id FROM nodes WHERE repo_hash = ? AND hierarchy_level = 'god'"
        : "SELECT id FROM nodes WHERE hierarchy_level = 'god'",
      repoHash ? [repoHash] : [],
    );
    return result.isErr() ? result : ok(result.value.map((row) => row.id));
  }
  detectDomains(
    repoHash: string,
    configuredDomains?: Record<string, string[]>,
  ) {
    const rows = this.#db.all<NodeRow>(
      'SELECT id, file_path FROM nodes WHERE repo_hash = ?',
      [repoHash],
    );
    if (rows.isErr()) return rows;
    const repo = this.#db.get<{ url: string }>(
      'SELECT url FROM repos WHERE repo_hash = ?',
      [repoHash],
    );
    if (repo.isErr()) return repo;
    const root = repo.value?.url?.replace(/[\\/]$/, '') ?? '';
    const groups = new Map<string, DomainGroup>();
    const begun = this.#db.run('BEGIN IMMEDIATE');
    if (begun.isErr()) return begun;
    for (const row of rows.value) {
      const relativePath =
        root && row.file_path.startsWith(root)
          ? row.file_path.slice(root.length).replace(/^[\\/]+/, '')
          : row.file_path;
      const name = this.#domain(relativePath, configuredDomains);
      const patterns = configuredDomains?.[name] ?? [
        `${name.toLowerCase()}/**`,
      ];
      const group = groups.get(name) ?? { name, patterns, nodeIds: [] };
      group.nodeIds.push(row.id);
      groups.set(name, group);
      const updated = this.#db.run(
        "UPDATE nodes SET metadata_json=json_set(COALESCE(metadata_json,'{}'),'$.domain',?) WHERE id=?",
        [name, row.id],
      );
      if (updated.isErr()) {
        void this.#db.run('ROLLBACK');
        return updated;
      }
    }
    const committed = this.#db.run('COMMIT');
    if (committed.isErr()) return committed;
    return ok(
      [...groups.values()].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }
  detectCommunities(repoHash: string) {
    const repo = this.#db.get<{ url: string }>(
      'SELECT url FROM repos WHERE repo_hash=?',
      [repoHash],
    );
    if (repo.isErr()) return repo;
    const root = repo.value?.url?.replace(/[\\/]$/, '') ?? '';
    const nodes = this.#db.all<NodeRow>(
      'SELECT id,file_path FROM nodes WHERE repo_hash=? ORDER BY file_path,id',
      [repoHash],
    );
    if (nodes.isErr()) return nodes;
    const edgeRows = this.#db.all<CommunityEdgeRow>(
      `SELECT e.source,e.target,e.type,e.weight,s.file_path AS source_file,t.file_path AS target_file
       FROM edges e JOIN nodes s ON s.id=e.source JOIN nodes t ON t.id=e.target
       WHERE s.repo_hash=? AND t.repo_hash=? AND e.type!='contains'
       ORDER BY s.file_path,t.file_path,e.type,e.source,e.target`,
      [repoHash, repoHash],
    );
    if (edgeRows.isErr()) return edgeRows;

    // Cluster modules, not individual syntax symbols. Symbols in the same file
    // inherit the file's community, so a class and its methods cannot drift into
    // unrelated clusters because of incidental call density.
    const filePaths = [
      ...new Set(nodes.value.map((node) => node.file_path)),
    ].sort((a, b) => a.localeCompare(b));
    const adjacency = new Map<
      string,
      Array<{ target: string; weight: number }>
    >();
    const pairs = new Map<string, number>();
    const addPair = (source: string, target: string, weight: number) => {
      if (source === target || !weight) return;
      const [left, right] =
        source.localeCompare(target) < 0 ? [source, target] : [target, source];
      const key = `${left}\0${right}`;
      pairs.set(key, (pairs.get(key) ?? 0) + weight);
    };
    for (const edge of edgeRows.value) {
      if (edge.source_file === edge.target_file) continue;
      const semanticWeight = this.#communityEdgeWeight(edge.type);
      const frequency = 1 + Math.log2(Math.max(1, Number(edge.weight)));
      addPair(edge.source_file, edge.target_file, semanticWeight * frequency);
    }

    // Directory/package affinity is deliberately weak: it stabilizes isolated
    // modules without overpowering actual imports, calls, types, and hooks.
    const areas = new Map<string, string[]>();
    for (const filePath of filePaths) {
      const area = this.#architectureArea(filePath, root);
      const files = areas.get(area) ?? [];
      files.push(filePath);
      areas.set(area, files);
    }
    for (const files of areas.values())
      for (let index = 1; index < files.length; index += 1)
        addPair(files[index - 1]!, files[index]!, 0.35);

    for (const [key, weight] of pairs) {
      const [source, target] = key.split('\0') as [string, string];
      adjacency.set(source, [
        ...(adjacency.get(source) ?? []),
        { target, weight },
      ]);
      adjacency.set(target, [
        ...(adjacency.get(target) ?? []),
        { target: source, weight },
      ]);
    }
    const assignments = computeLouvain(filePaths, adjacency);
    const begun = this.#db.run('BEGIN IMMEDIATE');
    if (begun.isErr()) return begun;
    const cleared = this.#db.run(
      "UPDATE nodes SET metadata_json=json_remove(COALESCE(metadata_json,'{}'),'$.community_id','$.community_area') WHERE repo_hash=?",
      [repoHash],
    );
    if (cleared.isErr()) {
      void this.#db.run('ROLLBACK');
      return cleared;
    }
    for (const node of nodes.value) {
      const communityId = assignments.get(node.file_path);
      if (communityId === undefined) continue;
      const updated = this.#db.run(
        "UPDATE nodes SET metadata_json=json_set(COALESCE(metadata_json,'{}'),'$.community_id',?,'$.community_area',?) WHERE id=?",
        [communityId, this.#architectureArea(node.file_path, root), node.id],
      );
      if (updated.isErr()) {
        void this.#db.run('ROLLBACK');
        return updated;
      }
    }
    const committed = this.#db.run('COMMIT');
    if (committed.isErr()) return committed;
    return this.communities(repoHash);
  }
  communities(repoHash: string, limit = 20) {
    const members = this.#db.all<{
      id: string;
      name: string;
      hierarchy_level: string;
      cid: number;
    }>(
      "SELECT id,name,hierarchy_level,json_extract(metadata_json,'$.community_id') AS cid FROM nodes WHERE repo_hash=? AND json_extract(metadata_json,'$.community_id') IS NOT NULL",
      [repoHash],
    );
    if (members.isErr()) return members;
    const edges = this.#db.all<{ source: string; target: string }>(
      "SELECT e.source,e.target FROM edges e JOIN nodes s ON s.id=e.source JOIN nodes t ON t.id=e.target WHERE s.repo_hash=? AND t.repo_hash=? AND e.type!='contains'",
      [repoHash, repoHash],
    );
    if (edges.isErr()) return edges;
    const nodeCommunity = new Map(
      members.value.map((node) => [node.id, Number(node.cid)]),
    );
    const grouped = new Map<number, typeof members.value>();
    for (const node of members.value) {
      const list = grouped.get(Number(node.cid)) ?? [];
      list.push(node);
      grouped.set(Number(node.cid), list);
    }
    const touching = new Map<number, number>();
    const internal = new Map<number, number>();
    for (const edge of edges.value) {
      const source = nodeCommunity.get(edge.source);
      const target = nodeCommunity.get(edge.target);
      if (source !== undefined)
        touching.set(source, (touching.get(source) ?? 0) + 1);
      if (target !== undefined && target !== source)
        touching.set(target, (touching.get(target) ?? 0) + 1);
      if (source !== undefined && source === target)
        internal.set(source, (internal.get(source) ?? 0) + 1);
    }
    const rank: Record<string, number> = { god: 0, high: 1, mid: 2, low: 3 };
    const result: CommunityInfo[] = [...grouped]
      .map(([id, nodes]) => ({
        id,
        nodeCount: nodes.length,
        cohesion:
          (touching.get(id) ?? 0)
            ? (internal.get(id) ?? 0) / touching.get(id)!
            : 0,
        topNodes: [...nodes]
          .sort(
            (a, b) =>
              (rank[a.hierarchy_level] ?? 3) - (rank[b.hierarchy_level] ?? 3),
          )
          .slice(0, 5)
          .map((node) => node.id),
      }))
      .sort((a, b) => b.nodeCount - a.nodeCount)
      .slice(0, limit);
    return ok(result);
  }
  communityMembers(repoHash: string, communityId: number, limit = 100) {
    const result = this.#db.all<{
      id: string;
      name: string;
      kind: string;
      file_path: string;
      hierarchy_level: string;
    }>(
      "SELECT id,name,kind,file_path,hierarchy_level FROM nodes WHERE repo_hash=? AND json_extract(metadata_json,'$.community_id')=? LIMIT ?",
      [repoHash, communityId, Math.max(1, limit)],
    );
    return result.isErr()
      ? result
      : ok(
          result.value.map(
            (node) =>
              ({
                id: node.id,
                name: node.name,
                kind: node.kind,
                filePath: node.file_path,
                hierarchyLevel: node.hierarchy_level,
              }) satisfies CommunityMember,
          ),
        );
  }
  crossCommunityEdges(
    repoHash: string,
    communityA: number,
    communityB: number,
    limit = 50,
  ) {
    const result = this.#db.all<{
      source: string;
      target: string;
      type: string;
      source_name: string;
      target_name: string;
    }>(
      `SELECT e.source,e.target,e.type,s.name AS source_name,t.name AS target_name FROM edges e
       JOIN nodes s ON s.id=e.source JOIN nodes t ON t.id=e.target
       WHERE s.repo_hash=? AND t.repo_hash=? AND e.type!='contains' AND
       ((json_extract(s.metadata_json,'$.community_id')=? AND json_extract(t.metadata_json,'$.community_id')=?) OR
        (json_extract(s.metadata_json,'$.community_id')=? AND json_extract(t.metadata_json,'$.community_id')=?)) LIMIT ?`,
      [
        repoHash,
        repoHash,
        communityA,
        communityB,
        communityB,
        communityA,
        Math.max(1, limit),
      ],
    );
    return result.isErr()
      ? result
      : ok(
          result.value.map(
            (edge) =>
              ({
                source: edge.source,
                target: edge.target,
                type: edge.type,
                sourceName: edge.source_name,
                targetName: edge.target_name,
              }) satisfies CrossCommunityEdge,
          ),
        );
  }
  #domain(filePath: string, configured?: Record<string, string[]>): string {
    if (configured)
      for (const [name, patterns] of Object.entries(configured))
        if (patterns.some((pattern) => this.#matches(filePath, pattern)))
          return name;
    const first = filePath.replace(/^\/+/, '').split('/')[0] || 'misc';
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  #matches(path: string, pattern: string): boolean {
    return new RegExp(
      `^${pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')}$`,
    ).test(path);
  }
  #architectureArea(filePath: string, root = ''): string {
    const normalized = filePath.replaceAll('\\', '/');
    const normalizedRoot = root.replaceAll('\\', '/');
    const clean = (
      normalizedRoot && normalized.startsWith(`${normalizedRoot}/`)
        ? normalized.slice(normalizedRoot.length + 1)
        : normalized
    ).replace(/^\/+/, '');
    const marker = clean.lastIndexOf('/packages/');
    const relative = marker >= 0 ? clean.slice(marker + 1) : clean;
    const parts = relative.split('/').filter(Boolean);
    if (parts[0] === 'packages') {
      if (parts[1] === 'extensions' && parts[2])
        return parts.slice(0, 3).join('/');
      return parts.slice(0, 2).join('/');
    }
    if (['apps', 'src', 'lib'].includes(parts[0] ?? '') && parts[1])
      return parts.slice(0, 2).join('/');
    return parts.length > 1 ? (parts[0] ?? 'root') : 'root';
  }
  #communityEdgeWeight(type: string): number {
    const weights: Record<string, number> = {
      extends: 9,
      implements: 8,
      import: 6,
      fires_hook: 5,
      listens_hook: 5,
      dispatches: 5,
      calls: 3,
      constructor: 3,
      return_type: 2,
      return: 2,
      type: 2,
      export: 1.5,
    };
    return weights[type] ?? 1;
  }
}
interface CountRow {
  id: string;
  count: number;
}
interface IdRow {
  id: string;
}
interface NodeRow {
  id: string;
  file_path: string;
}
interface CommunityEdgeRow {
  source: string;
  target: string;
  type: string;
  weight: number;
  source_file: string;
  target_file: string;
}
export type {
  AnalysisServiceContract,
  CommunityMember,
  CrossCommunityEdge,
  DomainGroup,
} from './type.js';
