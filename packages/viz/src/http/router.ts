import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  AnalysisService,
  CallGraphService,
  GraphRepository,
  GraphService,
  KnowledgeService,
  SearchService,
  WikiService,
} from '@vedh/core';
import { fromResult, json, readBody } from './respond.js';

export interface ApiContext {
  repoHash: string;
  graph: GraphService;
  repository: GraphRepository;
  calls: CallGraphService;
  analysis: AnalysisService;
  wiki: WikiService;
  search: SearchService;
  knowledge: KnowledgeService;
}

export async function routeApi(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  context: ApiContext,
): Promise<boolean> {
  const { pathname, searchParams } = url;
  const {
    repoHash,
    graph,
    repository,
    calls,
    analysis,
    wiki,
    search,
    knowledge,
  } = context;

  if (pathname === '/api/health') {
    json(response, { status: 'ok', repoHash });
    return true;
  }

  if (pathname === '/api/graph') {
    fromResult(response, graph.subgraph(repoHash));
    return true;
  }

  if (pathname === '/api/communities') {
    fromResult(
      response,
      analysis.communities(repoHash, Number(searchParams.get('limit')) || 50),
    );
    return true;
  }

  if (pathname === '/api/report') {
    const gods = analysis.godNodes(repoHash);
    const communities = analysis.communities(repoHash);
    const subgraph = graph.subgraph(repoHash);
    if (gods.isErr() || communities.isErr() || subgraph.isErr()) {
      json(response, { error: 'Report unavailable' }, 500);
    } else {
      json(response, {
        godNodes: gods.value,
        communities: communities.value,
        totalNodes: subgraph.value.nodes.length,
        totalEdges: subgraph.value.edges.length,
      });
    }
    return true;
  }

  if (pathname === '/api/execution/flow') {
    fromResult(
      response,
      calls.flow(repoHash, Number(searchParams.get('depth')) || 5),
    );
    return true;
  }

  if (pathname === '/api/search') {
    fromResult(response, search.search(repoHash, searchParams.get('q') ?? ''));
    return true;
  }

  const chain = pathname.match(/^\/api\/call-chain\/(.+)$/);
  if (chain) {
    fromResult(
      response,
      calls.chain(
        decodeURIComponent(chain[1]!),
        Number(searchParams.get('depth')) || 3,
      ),
    );
    return true;
  }

  const node = pathname.match(/^\/api\/node\/(.+)$/);
  if (node) {
    const id = decodeURIComponent(node[1]!);
    const record = repository.getNode(id);
    const edges = graph.neighbors(id);
    const page = wiki.get(id);
    const source = wiki.source(id);
    if (record.isErr() || edges.isErr() || page.isErr() || source.isErr()) {
      json(response, { error: 'Node unavailable' }, 500);
    } else {
      json(response, {
        node: record.value,
        edges: edges.value,
        wiki: page.value,
        source: source.value,
      });
    }
    return true;
  }

  const subgraph = pathname.match(/^\/api\/subgraph\/(.+)$/);
  if (subgraph) {
    fromResult(
      response,
      graph.impact(decodeURIComponent(subgraph[1]!), {
        maxDepth: Number(searchParams.get('depth')) || 2,
      }),
    );
    return true;
  }

  if (
    request.method === 'POST' &&
    (pathname === '/api/query' || pathname === '/api/concept')
  ) {
    const body = await readBody(request);
    json(
      response,
      pathname === '/api/query'
        ? await knowledge.answer(repoHash, String(body.question ?? ''))
        : await knowledge.concept(
            repoHash,
            Array.isArray(body.nodeIds) ? body.nodeIds.map(String) : [],
            String(body.question ?? 'Explain these symbols.'),
          ),
    );
    return true;
  }

  return false;
}
