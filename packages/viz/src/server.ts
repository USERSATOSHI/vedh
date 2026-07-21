import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import {
  AnalysisService,
  CallGraphService,
  CoreDatabase,
  GraphRepository,
  GraphService,
  KnowledgeService,
  SearchService,
  WikiService,
} from '@vedh/core';
import { json } from './http/respond.js';
import { routeApi, type ApiContext } from './http/router.js';
import { serveStatic } from './http/static.js';

export interface VizOptions {
  port?: number;
  dataDir?: string;
  host?: string;
}

export function startVizServer(
  projectDirectory: string,
  options: VizOptions = {},
) {
  const projectDir = resolve(projectDirectory);
  const repoHash = createHash('sha256')
    .update(projectDir)
    .digest('hex')
    .slice(0, 16);
  const opened = CoreDatabase.open({
    repoHash,
    projectDir,
    dataDir: options.dataDir,
  });
  if (opened.isErr()) throw new Error('Unable to open Vedh database');

  const db = opened.value;
  const context: ApiContext = {
    repoHash,
    graph: new GraphService(db),
    repository: new GraphRepository(db),
    calls: new CallGraphService(db),
    analysis: new AnalysisService(db),
    wiki: new WikiService(db),
    search: new SearchService(db),
    knowledge: new KnowledgeService(db),
  };

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(
        request.url ?? '/',
        `http://${request.headers.host ?? 'localhost'}`,
      );

      if (await serveStatic(url.pathname, response)) return;
      if (await routeApi(request, response, url, context)) return;
      json(response, { error: 'Not found' }, 404);
    } catch (cause) {
      json(
        response,
        { error: cause instanceof Error ? cause.message : String(cause) },
        500,
      );
    }
  });

  const host = options.host ?? '0.0.0.0';
  const port = options.port ?? 3001;
  server.listen(port, host, () =>
    console.log(`Vedh visualizer: http://${host}:${port}`),
  );
  server.on('close', () => db.close());
  return server;
}
