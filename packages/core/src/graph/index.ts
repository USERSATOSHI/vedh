import { ok, safeCall, type Result } from '@usersatoshi/results';
import type { EdgeInfo, NodeInfo, Subgraph } from '@vedh/types';
import { CoreDatabase } from '../db/index.js';
import type { CoreDatabaseError } from '../db/error.js';
import type {
  DependencyTree,
  DependencyTreeNode,
  GraphServiceContract,
  GraphWalkOptions,
} from './type.js';

export class GraphService implements GraphServiceContract {
  readonly #db: CoreDatabase;
  constructor(database: CoreDatabase) {
    this.#db = database;
  }

  walk(
    startNodeId: string,
    options: GraphWalkOptions = {},
  ): Result<Subgraph, CoreDatabaseError> {
    const visited = new Set<string>();
    const nodes: NodeInfo[] = [];
    const maxDepth = options.maxDepth ?? 5;
    const collect = (
      id: string,
      depth: number,
    ): Result<void, CoreDatabaseError> => {
      if (depth > maxDepth || visited.has(id)) return ok(undefined);
      visited.add(id);
      const node = this.#node(id);
      if (node.isErr()) return node;
      if (node.value) nodes.push(node.value);
      const edges = this.neighbors(id);
      if (edges.isErr()) return edges;
      for (const edge of edges.value) {
        if (!this.#matches(edge, options.edgeTypes)) continue;
        const next = edge.source === id ? edge.target : edge.source;
        const nextResult = collect(next, depth + 1);
        if (nextResult.isErr()) return nextResult;
      }
      return ok(undefined);
    };
    const collected = collect(startNodeId, 0);
    if (collected.isErr()) return collected;
    return this.#subgraphForVisited(visited, nodes, options.edgeTypes);
  }

  impact(
    startNodeId: string,
    options: GraphWalkOptions = {},
  ): Result<Subgraph, CoreDatabaseError> {
    const maxDepth = options.maxDepth ?? 3;
    const visited = new Set([startNodeId]);
    const nodes: NodeInfo[] = [];
    const queue = [{ id: startNodeId, depth: 0 }];
    for (let head = 0; head < queue.length; head++) {
      const current = queue[head]!;
      const node = this.#node(current.id);
      if (node.isErr()) return node;
      if (node.value) nodes.push(node.value);
      if (current.depth >= maxDepth) continue;
      const edges = this.neighbors(current.id);
      if (edges.isErr()) return edges;
      for (const edge of edges.value) {
        if (!this.#matches(edge, options.edgeTypes)) continue;
        const next = edge.source === current.id ? edge.target : edge.source;
        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ id: next, depth: current.depth + 1 });
        }
      }
    }
    return this.#subgraphForVisited(visited, nodes, options.edgeTypes);
  }

  shortestPath(
    fromId: string,
    toId: string,
    maxDepth = 20,
  ): Result<string[], CoreDatabaseError> {
    if (fromId === toId) return ok([fromId]);
    const visited = new Set([fromId]);
    const parent = new Map<string, string>();
    const queue = [{ id: fromId, depth: 0 }];
    for (let head = 0; head < queue.length; head++) {
      const current = queue[head]!;
      if (current.depth >= maxDepth) continue;
      const edges = this.neighbors(current.id);
      if (edges.isErr()) return edges;
      for (const edge of edges.value) {
        const next = edge.source === current.id ? edge.target : edge.source;
        if (visited.has(next)) continue;
        visited.add(next);
        parent.set(next, current.id);
        if (next === toId) {
          const path = [toId];
          for (let id = toId; id !== fromId;) {
            id = parent.get(id)!;
            path.unshift(id);
          }
          return ok(path);
        }
        queue.push({ id: next, depth: current.depth + 1 });
      }
    }
    return ok([]);
  }

  neighbors(nodeId: string): Result<EdgeInfo[], CoreDatabaseError> {
    return this.#db.all<EdgeInfo>(
      'SELECT * FROM edges WHERE source = ? OR target = ?',
      [nodeId, nodeId],
    );
  }
  subgraph(repoHash: string): Result<Subgraph, CoreDatabaseError> {
    const nodes = this.#nodes(repoHash);
    if (nodes.isErr()) return nodes;
    const edges = this.#db.all<EdgeInfo>(
      'SELECT e.* FROM edges e JOIN nodes n ON n.id = e.source WHERE n.repo_hash = ?',
      [repoHash],
    );
    return edges.isErr()
      ? edges
      : ok({ nodes: nodes.value, edges: edges.value });
  }

  dependencyTree(
    nodeId: string,
    direction: 'in' | 'out',
    maxDepth = 2,
    budget = 200,
  ): Result<DependencyTree, CoreDatabaseError> {
    const visited = new Set([nodeId]);
    let remaining = Math.max(0, budget);
    const build = (
      id: string,
      depth: number,
    ): Result<DependencyTreeNode[], CoreDatabaseError> => {
      if (depth >= maxDepth || remaining <= 0) return ok([]);
      const edges = this.#db.all<EdgeInfo>(
        direction === 'out'
          ? "SELECT * FROM edges WHERE source = ? AND type != 'contains'"
          : "SELECT * FROM edges WHERE target = ? AND type != 'contains'",
        [id],
      );
      if (edges.isErr()) return edges;
      const children: DependencyTreeNode[] = [];
      for (const edge of edges.value) {
        const next = direction === 'out' ? edge.target : edge.source;
        if (visited.has(next) || remaining <= 0) continue;
        visited.add(next);
        const node = this.#node(next);
        if (node.isErr()) return node;
        if (!node.value) continue;
        remaining--;
        const nested = build(next, depth + 1);
        if (nested.isErr()) return nested;
        let metadata: {
          call_sites?: Array<Record<string, unknown>>;
          sub_kind?: string;
        } = {};
        try {
          metadata = JSON.parse(edge.metadata_json ?? '{}') as typeof metadata;
        } catch {
          /* malformed optional metadata */
        }
        children.push({
          id: next,
          edgeType: edge.type,
          node: node.value,
          children: nested.value,
          callSites: metadata.call_sites,
          subKind: metadata.sub_kind,
        });
      }
      return ok(children);
    };
    const tree = build(nodeId, 0);
    return tree.isErr()
      ? tree
      : ok({ tree: tree.value, truncated: remaining <= 0 });
  }

  #node(id: string): Result<NodeInfo | null, CoreDatabaseError> {
    const result = this.#db.get<NodeRow>('SELECT * FROM nodes WHERE id = ?', [
      id,
    ]);
    return result.isErr()
      ? result
      : ok(result.value ? this.#mapNode(result.value) : null);
  }
  #nodes(repoHash: string): Result<NodeInfo[], CoreDatabaseError> {
    const result = this.#db.all<NodeRow>(
      'SELECT * FROM nodes WHERE repo_hash = ?',
      [repoHash],
    );
    return result.isErr()
      ? result
      : ok(result.value.map((row) => this.#mapNode(row)));
  }
  #mapNode(row: NodeRow): NodeInfo {
    const parsed = safeCall(
      () => JSON.parse(row.metadata_json) as Record<string, unknown>,
      () => ({ kind: -1 as const }),
    );
    return { ...row, metadata: parsed.isOk() ? parsed.value : {} };
  }
  #matches(edge: EdgeInfo, types: readonly string[] | undefined): boolean {
    if (!types?.length) return true;
    const aliases: Record<string, readonly string[]> = {
      import: ['import', 'imports'],
      export: ['export', 'exports'],
      calls: ['call', 'calls'],
      constructor: ['constructor', 'constructors'],
      extends: ['extend', 'extends'],
      implements: ['implement', 'implements'],
    };
    return types.some((type) =>
      (aliases[edge.type] ?? [edge.type]).includes(type.toLowerCase()),
    );
  }
  #subgraphForVisited(
    visited: Set<string>,
    nodes: NodeInfo[],
    types: readonly string[] | undefined,
  ): Result<Subgraph, CoreDatabaseError> {
    const edges: EdgeInfo[] = [];
    const known = new Set<string>();
    for (const id of visited) {
      const result = this.neighbors(id);
      if (result.isErr()) return result;
      for (const edge of result.value) {
        const key = `${edge.source}|${edge.target}|${edge.type}`;
        if (
          visited.has(edge.source) &&
          visited.has(edge.target) &&
          this.#matches(edge, types) &&
          !known.has(key)
        ) {
          known.add(key);
          edges.push(edge);
        }
      }
    }
    return ok({ nodes, edges });
  }
}
interface NodeRow extends Omit<NodeInfo, 'metadata'> {
  metadata_json: string;
}
export type {
  DependencyTree,
  DependencyTreeNode,
  GraphServiceContract,
  GraphWalkOptions,
} from './type.js';
