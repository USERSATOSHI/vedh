import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  AnalysisService,
  CallGraphService,
  CoreDatabase,
  GraphRepository,
  GraphService,
  INDEX_SCHEMA_VERSION,
  SearchService,
  WikiService,
} from '@vedh/core';

interface Request {
  jsonrpc: string;
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

const TOOLS = [
  [
    'search_nodes',
    'Search symbols by name, path, docs, or summary',
    { query: 'string', limit: 'number?' },
  ],
  ['get_node', 'Get a symbol node by id', { node_id: 'string' }],
  [
    'get_callers',
    'Get transitive callers',
    { node_id: 'string', depth: 'number?' },
  ],
  [
    'get_callees',
    'Get transitive callees',
    { node_id: 'string', depth: 'number?' },
  ],
  ['read_source', 'Read source for a symbol', { node_id: 'string' }],
  [
    'get_wiki',
    'Get generated documentation for a symbol',
    { node_id: 'string' },
  ],
  [
    'get_god_nodes',
    'Get highly connected architectural nodes',
    { limit: 'number?' },
  ],
  [
    'get_shortest_path',
    'Find a graph path between symbols',
    { from_id: 'string', to_id: 'string' },
  ],
  [
    'get_flow_from_entry',
    'Trace execution from detected entry points',
    { depth: 'number?' },
  ],
  [
    'bfs_subgraph',
    'Traverse a bounded graph neighborhood with BFS or DFS',
    {
      node_id: 'string',
      depth: 'number?',
      mode: 'string?',
      edge_types: 'string?',
    },
  ],
  [
    'get_dependency_tree',
    'Get a nested dependency tree',
    {
      node_id: 'string',
      direction: 'string?',
      depth: 'number?',
      limit: 'number?',
    },
  ],
  ['list_communities', 'List detected code communities', { limit: 'number?' }],
  [
    'get_community_members',
    'List members of one community',
    { community_id: 'number', limit: 'number?' },
  ],
  [
    'get_cross_community_edges',
    'Show coupling between communities',
    { community_a: 'number', community_b: 'number', limit: 'number?' },
  ],
  [
    'find_hook_callsites',
    'Find event fire and listener sites',
    { pattern: 'string', limit: 'number?' },
  ],
  [
    'find_call_sites',
    'Find every recorded call site by target name',
    { name: 'string', limit: 'number?' },
  ],
  ['get_snapshot', 'Report graph freshness against the checkout', {}],
] as const;

function schema(properties: Record<string, string>) {
  const required = Object.entries(properties)
    .filter(([, type]) => !type.endsWith('?'))
    .map(([name]) => name);
  return {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(properties).map(([name, raw]) => {
        const type = raw.replace('?', '');
        return [name, { type }];
      }),
    ),
    ...(required.length ? { required } : {}),
  };
}

export function startMcpServer(
  projectDirectory: string,
  dataDir?: string,
): void {
  const projectDir = resolve(projectDirectory);
  const repoHash = createHash('sha256')
    .update(projectDir)
    .digest('hex')
    .slice(0, 16);
  const opened = CoreDatabase.open({ repoHash, projectDir, dataDir });
  if (opened.isErr()) throw new Error('Unable to open Vedh graph database');
  const db = opened.value;
  const repository = new GraphRepository(db);
  const graph = new GraphService(db);
  const callGraph = new CallGraphService(db);
  const analysis = new AnalysisService(db);
  const wiki = new WikiService(db);
  const send = (message: unknown) =>
    process.stdout.write(`${JSON.stringify(message)}\n`);
  const result = (id: Request['id'], value: unknown) =>
    send({ jsonrpc: '2.0', id, result: value });
  const error = (id: Request['id'], message: string) =>
    send({ jsonrpc: '2.0', id, error: { code: -32000, message } });
  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => {
    buffer += chunk;
    for (;;) {
      const newline = buffer.indexOf('\n');
      if (newline < 0) break;
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      void (async () => {
        let request: Request;
        try {
          request = JSON.parse(line) as Request;
        } catch {
          return error(undefined, 'Invalid JSON');
        }
        try {
          if (request.method === 'initialize')
            return result(request.id, {
              protocolVersion: '2025-03-26',
              capabilities: { tools: {} },
              serverInfo: { name: 'vedh-mcp', version: '0.1.0' },
            });
          if (request.method === 'notifications/initialized') return;
          if (request.method === 'tools/list')
            return result(request.id, {
              tools: TOOLS.map(([name, description, properties]) => ({
                name,
                description,
                inputSchema: schema(properties),
              })),
            });
          if (request.method !== 'tools/call')
            return error(request.id, `Unknown method: ${request.method}`);
          const params = request.params as
            { name?: string; arguments?: Record<string, unknown> } | undefined;
          const value = await callTool(
            params?.name ?? '',
            params?.arguments ?? {},
          );
          return result(request.id, {
            content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
          });
        } catch (cause) {
          return error(
            request.id,
            cause instanceof Error ? cause.message : String(cause),
          );
        }
      })();
    }
  });
  process.on('exit', () => db.close());

  async function callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const limit = Math.max(1, Number(args.limit) || 100);
    if (name === 'search_nodes')
      return unwrap(
        new SearchService(db).search(repoHash, String(args.query ?? '')),
      ).slice(0, limit);
    if (name === 'get_node')
      return unwrap(repository.getNode(String(args.node_id)));
    if (name === 'get_callers' || name === 'get_callees') {
      const chain = unwrap(
        callGraph.chain(String(args.node_id), Number(args.depth) || 3),
      );
      return name === 'get_callers' ? chain.callers : chain.callees;
    }
    if (name === 'read_source')
      return { source: unwrap(wiki.source(String(args.node_id))) };
    if (name === 'get_wiki') return unwrap(wiki.get(String(args.node_id)));
    if (name === 'get_god_nodes')
      return unwrap(analysis.godNodes(repoHash)).slice(0, limit);
    if (name === 'get_shortest_path')
      return unwrap(
        graph.shortestPath(String(args.from_id), String(args.to_id)),
      );
    if (name === 'get_flow_from_entry')
      return unwrap(callGraph.flow(repoHash, Number(args.depth) || 5));
    if (name === 'bfs_subgraph') {
      const traversal =
        args.mode === 'dfs' ? graph.walk.bind(graph) : graph.impact.bind(graph);
      return unwrap(
        traversal(String(args.node_id), {
          maxDepth: Number(args.depth) || 2,
          edgeTypes: String(args.edge_types ?? '')
            .split(',')
            .filter(Boolean),
        }),
      );
    }
    if (name === 'get_dependency_tree') {
      const nodeId = String(args.node_id);
      const depth = Number(args.depth) || 3;
      if (args.direction === 'both' || args.direction === undefined)
        return {
          dependencies: unwrap(
            graph.dependencyTree(nodeId, 'out', depth, limit),
          ),
          dependents: unwrap(graph.dependencyTree(nodeId, 'in', depth, limit)),
        };
      return unwrap(
        graph.dependencyTree(
          nodeId,
          args.direction === 'in' ? 'in' : 'out',
          depth,
          limit,
        ),
      );
    }
    if (name === 'list_communities')
      return unwrap(analysis.communities(repoHash, limit));
    if (name === 'get_community_members')
      return unwrap(
        analysis.communityMembers(repoHash, Number(args.community_id), limit),
      );
    if (name === 'get_cross_community_edges')
      return unwrap(
        analysis.crossCommunityEdges(
          repoHash,
          Number(args.community_a),
          Number(args.community_b),
          limit,
        ),
      );
    if (name === 'find_hook_callsites') {
      const hooks = unwrap(
        db.all<{ id: string; name: string }>(
          "SELECT id,name FROM nodes WHERE repo_hash=? AND kind='event' AND name LIKE ? LIMIT ?",
          [repoHash, `%${String(args.pattern ?? '')}%`, limit],
        ),
      );
      return hooks.map((hook) => ({
        ...hook,
        edges: unwrap(
          db.all('SELECT * FROM edges WHERE source=? OR target=?', [
            hook.id,
            hook.id,
          ]),
        ),
      }));
    }
    if (name === 'find_call_sites') {
      const definitions = unwrap(
        db.all<{ id: string; name: string }>(
          "SELECT id,name FROM nodes WHERE repo_hash=? AND name LIKE ? AND kind NOT IN ('module','event') LIMIT 50",
          [repoHash, `%${String(args.name)}%`],
        ),
      );
      return definitions.flatMap((definition) =>
        unwrap(
          db.all(
            "SELECT * FROM edges WHERE target=? AND type IN ('calls','constructor') LIMIT ?",
            [definition.id, limit],
          ),
        ),
      );
    }
    if (name === 'get_snapshot') {
      const repo = unwrap(
        db.get<{
          indexed_at: string;
          commit_hash: string;
          node_count: number;
          file_count: number;
          schema_version: string;
        }>(
          'SELECT indexed_at,commit_hash,node_count,file_count,schema_version FROM repos WHERE repo_hash=?',
          [repoHash],
        ),
      );
      const head = spawnSync('git', ['-C', projectDir, 'rev-parse', 'HEAD'], {
        encoding: 'utf8',
      });
      const currentCommit = head.status === 0 ? head.stdout.trim() : null;
      return {
        ...repo,
        parserSchemaVersion: INDEX_SCHEMA_VERSION,
        currentCommit,
        schemaStale: Boolean(
          repo?.schema_version && repo.schema_version !== INDEX_SCHEMA_VERSION,
        ),
        stale:
          Boolean(
            repo?.commit_hash &&
            currentCommit &&
            repo.commit_hash !== currentCommit,
          ) ||
          Boolean(
            repo?.schema_version &&
            repo.schema_version !== INDEX_SCHEMA_VERSION,
          ),
      };
    }
    throw new Error(`Unknown tool: ${name}`);
  }
}

function unwrap<T>(value: { isErr(): boolean; error?: unknown; value?: T }): T {
  if (value.isErr()) throw new Error(String(value.error));
  return value.value as T;
}
