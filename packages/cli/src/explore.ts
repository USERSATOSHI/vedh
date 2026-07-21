import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { err, ok } from '@usersatoshi/results';
import {
  AnalysisService,
  CallGraphService,
  CoreDatabase,
  GraphRepository,
  GraphService,
  INDEX_SCHEMA_VERSION,
  KnowledgeService,
  SearchService,
  WikiService,
} from '@vedh/core';
import type {
  CallChain,
  DependencyTreeNode,
  EdgeInfo,
  ExecutionFlow,
  NodeInfo,
  Subgraph,
} from '@vedh/core';
import { CliErrorKind, toCliError } from './error.js';

export interface ExploreOptions {
  scope?: string;
  exclude?: string;
  tier?: string;
  limit?: string | number;
}

export class ExploreCommand {
  readonly #dataDir?: string;
  readonly #stdout: (line: string) => void;
  constructor(dataDir: string | undefined, stdout: (line: string) => void) {
    this.#dataDir = dataDir;
    this.#stdout = stdout;
  }

  async run(
    projectDirectory: string,
    operation: string,
    args: readonly string[],
    options: ExploreOptions = {},
  ) {
    const projectDir = resolve(projectDirectory);
    const repoHash = createHash('sha256')
      .update(projectDir)
      .digest('hex')
      .slice(0, 16);
    if (operation === 'hash') {
      this.#stdout(repoHash);
      return ok(undefined);
    }
    if (operation === 'repos') {
      const root =
        this.#dataDir ?? process.env.VEDH_DATA_DIR ?? join(homedir(), '.vedh');
      const repos = existsSync(root)
        ? readdirSync(root, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => {
              const directory = join(root, entry.name);
              const pointer = join(directory, 'local-path');
              return {
                repoHash: entry.name,
                projectDir: existsSync(pointer)
                  ? readFileSync(pointer, 'utf8').trim()
                  : null,
                database: join(directory, 'kb.sqlite'),
              };
            })
        : [];
      this.#stdout(JSON.stringify({ repos }, null, 2));
      return ok(undefined);
    }
    const opened = CoreDatabase.open({
      repoHash,
      projectDir,
      dataDir: this.#dataDir,
    });
    if (opened.isErr())
      return err(toCliError(CliErrorKind.CoreFailed, { cause: opened.error }));
    const db = opened.value;
    const repository = new GraphRepository(db);
    const graph = new GraphService(db);
    const analysis = new AnalysisService(db);
    const callGraph = new CallGraphService(db);
    const wiki = new WikiService(db);
    const limit = Math.max(1, Number(options.limit) || 100);
    const emit = (value: unknown) => {
      this.#stdout(JSON.stringify(value, null, 2));
      db.close();
      return ok(undefined);
    };
    const fail = (cause: unknown) => {
      db.close();
      return err(toCliError(CliErrorKind.CoreFailed, { cause }));
    };
    const required = (message: string) => {
      db.close();
      return err(toCliError(CliErrorKind.InvalidArguments, { message }));
    };

    if (operation === 'search') {
      const result = new SearchService(db).search(repoHash, args.join(' '));
      if (result.isErr()) return fail(result.error);
      return emit({
        results: result.value
          .filter((item) => this.#allowed(item.filePath, projectDir, options))
          .slice(0, limit),
      });
    }
    if (operation === 'node') {
      if (!args[0]) return required('Usage: vedh explore <path> node <id>');
      const node = repository.getNode(args[0]);
      if (node.isErr()) return fail(node.error);
      return emit({ node: node.value });
    }
    if (operation === 'source') {
      if (!args[0]) return required('Usage: vedh explore <path> source <id>');
      const source = wiki.source(args[0]);
      if (source.isErr()) return fail(source.error);
      return emit({ id: args[0], source: source.value });
    }
    if (operation === 'wiki') {
      if (!args[0]) return required('Usage: vedh explore <path> wiki <id>');
      const page = wiki.get(args[0]);
      if (page.isErr()) return fail(page.error);
      return emit({ wiki: page.value });
    }
    if (
      operation === 'callers' ||
      operation === 'callees' ||
      operation === 'chain'
    ) {
      if (!args[0])
        return required(`Usage: vedh explore <path> ${operation} <id> [depth]`);
      const chain = callGraph.chain(args[0], Number(args[1]) || 3);
      if (chain.isErr()) return fail(chain.error);
      const filtered = this.#filterChain(chain.value, projectDir, options);
      return emit(
        operation === 'chain'
          ? filtered
          : {
              root: filtered.root,
              [operation]: filtered[operation].slice(0, limit),
            },
      );
    }
    if (operation === 'flow') {
      const result = callGraph.flow(repoHash, Number(args[0]) || 5);
      if (result.isErr()) return fail(result.error);
      return emit(this.#filterFlow(result.value, projectDir, options, limit));
    }
    if (operation === 'path') {
      if (!args[0] || !args[1])
        return required('Usage: vedh explore <path> path <from-id> <to-id>');
      const result = graph.shortestPath(args[0], args[1]);
      if (result.isErr()) return fail(result.error);
      return emit({ path: result.value });
    }
    if (operation === 'neighbors') {
      if (!args[0])
        return required('Usage: vedh explore <path> neighbors <id>');
      const result = graph.neighbors(args[0]);
      if (result.isErr()) return fail(result.error);
      const edges = this.#filterEdges(
        result.value,
        repository,
        projectDir,
        options,
      );
      return emit({ edges: edges.slice(0, limit) });
    }
    if (operation === 'bfs') {
      if (!args[0])
        return required(
          'Usage: vedh explore <path> bfs <id> [depth] [bfs|dfs] [limit] [edge-types]',
        );
      const mode = args[2] === 'dfs' ? 'dfs' : 'bfs';
      const edgeTypes =
        args[2] === 'bfs' || args[2] === 'dfs' ? args[4] : args[2];
      const traversalLimit =
        args[2] === 'bfs' || args[2] === 'dfs'
          ? Math.max(1, Number(args[3]) || limit)
          : limit;
      const result = (mode === 'dfs' ? graph.walk : graph.impact).call(
        graph,
        args[0],
        {
          maxDepth: Number(args[1]) || 2,
          edgeTypes: edgeTypes?.split(',').filter(Boolean),
        },
      );
      if (result.isErr()) return fail(result.error);
      return emit(
        this.#filterSubgraph(result.value, projectDir, options, traversalLimit),
      );
    }
    if (operation === 'deps') {
      if (!args[0])
        return required(
          'Usage: vedh explore <path> deps <id> [both|in|out] [depth]',
        );
      const direction = ['in', 'out', 'both'].includes(args[1] ?? '')
        ? args[1]!
        : 'both';
      const depth = Number(args[2]) || 3;
      const load = (value: 'in' | 'out') =>
        graph.dependencyTree(args[0]!, value, depth, limit);
      if (direction === 'both') {
        const outgoing = load('out');
        if (outgoing.isErr()) return fail(outgoing.error);
        const incoming = load('in');
        if (incoming.isErr()) return fail(incoming.error);
        return emit({
          dependencies: this.#filterDependencyTree(
            outgoing.value.tree,
            projectDir,
            options,
          ),
          dependents: this.#filterDependencyTree(
            incoming.value.tree,
            projectDir,
            options,
          ),
          dependenciesTruncated: outgoing.value.truncated,
          dependentsTruncated: incoming.value.truncated,
        });
      }
      const result = load(direction as 'in' | 'out');
      if (result.isErr()) return fail(result.error);
      return emit({
        ...result.value,
        tree: this.#filterDependencyTree(
          result.value.tree,
          projectDir,
          options,
        ),
      });
    }
    if (operation === 'god') {
      const ids = analysis.godNodes(repoHash);
      if (ids.isErr()) return fail(ids.error);
      const nodes = ids.value.flatMap((id) => {
        const node = repository.getNode(id);
        return node.isOk() &&
          node.value &&
          this.#allowed(node.value.file_path, projectDir, options)
          ? [node.value]
          : [];
      });
      return emit({ nodes: nodes.slice(0, limit) });
    }
    if (operation === 'nodes') {
      const result = repository.getNodes(repoHash);
      if (result.isErr()) return fail(result.error);
      return emit({
        nodes: result.value
          .filter((node) => this.#allowed(node.file_path, projectDir, options))
          .slice(0, limit),
      });
    }
    if (operation === 'communities') {
      let result = analysis.communities(repoHash, limit);
      if (result.isErr()) return fail(result.error);
      if (!result.value.length) result = analysis.detectCommunities(repoHash);
      if (result.isErr()) return fail(result.error);
      return emit({ communities: result.value.slice(0, limit) });
    }
    if (operation === 'community') {
      const id = Number(args[0]);
      if (!Number.isFinite(id))
        return required('Usage: vedh explore <path> community <id>');
      const result = analysis.communityMembers(repoHash, id, limit);
      if (result.isErr()) return fail(result.error);
      return emit({
        id,
        members: result.value.filter((member) =>
          this.#allowed(member.filePath, projectDir, options),
        ),
      });
    }
    if (operation === 'cross-community') {
      const a = Number(args[0]);
      const b = Number(args[1]);
      if (!Number.isFinite(a) || !Number.isFinite(b))
        return required('Usage: vedh explore <path> cross-community <a> <b>');
      const result = analysis.crossCommunityEdges(repoHash, a, b, limit);
      if (result.isErr()) return fail(result.error);
      const edges = result.value.filter((edge) => {
        const source = repository.getNode(edge.source);
        const target = repository.getNode(edge.target);
        return (
          source.isOk() &&
          target.isOk() &&
          source.value &&
          target.value &&
          this.#allowed(source.value.file_path, projectDir, options) &&
          this.#allowed(target.value.file_path, projectDir, options)
        );
      });
      return emit({ edges });
    }
    if (operation === 'hooks') {
      const pattern = args[0] ?? '';
      const hooks = db.all<{ id: string; name: string; metadata_json: string }>(
        "SELECT id,name,metadata_json FROM nodes WHERE repo_hash=? AND kind='event' AND name LIKE ? LIMIT ?",
        [repoHash, `%${pattern}%`, limit],
      );
      if (hooks.isErr()) return fail(hooks.error);
      const result = hooks.value
        .map((hook) => {
          const edges = db.all<EdgeInfo>(
            'SELECT * FROM edges WHERE source=? OR target=?',
            [hook.id, hook.id],
          );
          return {
            ...hook,
            edges: edges.isOk()
              ? this.#filterEdges(
                  edges.value,
                  repository,
                  projectDir,
                  options,
                  true,
                )
              : [],
          };
        })
        .filter(
          (hook) =>
            hook.edges.length > 0 ||
            (!options.scope && !options.exclude && !options.tier),
        );
      return emit({ hooks: result });
    }
    if (operation === 'calls') {
      if (!args[0]) return required('Usage: vedh explore <path> calls <name>');
      const definitions = db.all<{
        id: string;
        name: string;
        kind: string;
        file_path: string;
      }>(
        "SELECT id,name,kind,file_path FROM nodes WHERE repo_hash=? AND name LIKE ? AND kind NOT IN ('module','event') LIMIT 50",
        [repoHash, `%${args[0]}%`],
      );
      if (definitions.isErr()) return fail(definitions.error);
      const scopedDefinitions = definitions.value.filter((definition) =>
        this.#allowed(definition.file_path, projectDir, options),
      );
      const callSites = scopedDefinitions.flatMap((definition) => {
        const edges = db.all<EdgeInfo>(
          "SELECT * FROM edges WHERE target=? AND type IN ('calls','constructor')",
          [definition.id],
        );
        return edges.isOk()
          ? this.#filterEdges(edges.value, repository, projectDir, options)
          : [];
      });
      return emit({
        definitions: scopedDefinitions,
        callSites: callSites.slice(0, limit),
      });
    }
    if (operation === 'snapshot') {
      const repo = db.get<{
        indexed_at: string;
        commit_hash: string;
        node_count: number;
        file_count: number;
        schema_version: string;
      }>(
        'SELECT indexed_at,commit_hash,node_count,file_count,schema_version FROM repos WHERE repo_hash=?',
        [repoHash],
      );
      if (repo.isErr()) return fail(repo.error);
      const current = spawnSync(
        'git',
        ['-C', projectDir, 'rev-parse', 'HEAD'],
        { encoding: 'utf8' },
      );
      const currentCommit = current.status === 0 ? current.stdout.trim() : null;
      return emit({
        repoHash,
        ...repo.value,
        parserSchemaVersion: INDEX_SCHEMA_VERSION,
        currentCommit,
        schemaStale: Boolean(
          repo.value?.schema_version &&
          repo.value.schema_version !== INDEX_SCHEMA_VERSION,
        ),
        stale:
          Boolean(
            repo.value?.commit_hash &&
            currentCommit &&
            repo.value.commit_hash !== currentCommit,
          ) ||
          Boolean(
            repo.value?.schema_version &&
            repo.value.schema_version !== INDEX_SCHEMA_VERSION,
          ),
      });
    }
    if (operation === 'query') {
      const question = args.join(' ').trim();
      const callers = question.match(/(?:what|who)\s+calls\s+(.+?)[?]?$/i);
      const callees = question.match(/what\s+does\s+(.+?)\s+call[?]?$/i);
      const trace = question.match(/trace\s+(.+?)[?]?$/i);
      const neighbors = question.match(/neighbors?(?:\s+of)?\s+(.+?)[?]?$/i);
      const dependencies = question.match(
        /(?:dependencies|deps)(?:\s+of)?\s+(.+?)[?]?$/i,
      );
      const dependents = question.match(/dependents(?:\s+of)?\s+(.+?)[?]?$/i);
      const path = question.match(
        /(?:path|route)\s+from\s+(.+?)\s+to\s+(.+?)[?]?$/i,
      );
      const findNode = (name: string) => {
        const found = new SearchService(db).search(repoHash, name.trim());
        if (found.isErr()) return found;
        return ok(
          found.value.find((item) =>
            this.#allowed(item.filePath, projectDir, options),
          )?.id ?? null,
        );
      };
      if (path) {
        const from = findNode(path[1]!);
        if (from.isErr()) return fail(from.error);
        const to = findNode(path[2]!);
        if (to.isErr()) return fail(to.error);
        if (!from.value || !to.value)
          return emit({
            answer: 'One or both symbols were not found.',
            path: [],
          });
        const result = graph.shortestPath(from.value, to.value);
        if (result.isErr()) return fail(result.error);
        return emit({ from: from.value, to: to.value, path: result.value });
      }
      const graphNamed = neighbors?.[1] ?? dependencies?.[1] ?? dependents?.[1];
      if (graphNamed) {
        const found = findNode(graphNamed);
        if (found.isErr()) return fail(found.error);
        if (!found.value)
          return emit({ answer: 'No matching symbol was found.', sources: [] });
        if (neighbors) {
          const result = graph.neighbors(found.value);
          if (result.isErr()) return fail(result.error);
          return emit({
            root: found.value,
            edges: this.#filterEdges(
              result.value,
              repository,
              projectDir,
              options,
            ).slice(0, limit),
          });
        }
        const result = graph.dependencyTree(
          found.value,
          dependents ? 'in' : 'out',
          3,
          limit,
        );
        if (result.isErr()) return fail(result.error);
        return emit({
          root: found.value,
          direction: dependents ? 'in' : 'out',
          ...result.value,
          tree: this.#filterDependencyTree(
            result.value.tree,
            projectDir,
            options,
          ),
        });
      }
      const named = callers?.[1] ?? callees?.[1] ?? trace?.[1];
      if (named) {
        const found = findNode(named);
        if (found.isErr()) return fail(found.error);
        const id = found.value;
        if (!id)
          return emit({ answer: 'No matching symbol was found.', sources: [] });
        const chain = callGraph.chain(id, 4);
        if (chain.isErr()) return fail(chain.error);
        const filtered = this.#filterChain(chain.value, projectDir, options);
        return emit(
          callers
            ? { root: filtered.root, callers: filtered.callers }
            : callees
              ? { root: filtered.root, callees: filtered.callees }
              : filtered,
        );
      }
      if (/\b(?:execution\s+)?flow\b/i.test(question)) {
        const flow = callGraph.flow(repoHash, 5);
        if (flow.isErr()) return fail(flow.error);
        return emit(this.#filterFlow(flow.value, projectDir, options, limit));
      }
      if (/\b(?:overview|summary|stats|statistics)\b/i.test(question)) {
        const counts = db.get<{
          nodes: number;
          edges: number;
          files: number;
        }>(
          `SELECT
            (SELECT COUNT(*) FROM nodes WHERE repo_hash=?) AS nodes,
            (SELECT COUNT(*) FROM edges e JOIN nodes n ON n.id=e.source WHERE n.repo_hash=?) AS edges,
            (SELECT COUNT(DISTINCT file_path) FROM nodes WHERE repo_hash=?) AS files`,
          [repoHash, repoHash, repoHash],
        );
        if (counts.isErr()) return fail(counts.error);
        return emit({ repoHash, ...counts.value });
      }
      const answer = await new KnowledgeService(db).answer(repoHash, question);
      return emit(answer);
    }
    return required(`Unknown explore operation: ${operation}`);
  }

  #filterSubgraph(
    graph: Subgraph,
    projectDir: string,
    options: ExploreOptions,
    limit: number,
  ): Subgraph {
    const nodes = graph.nodes
      .filter((node) => this.#allowed(node.file_path, projectDir, options))
      .slice(0, limit);
    const ids = new Set(nodes.map((node) => node.id));
    return {
      nodes,
      edges: graph.edges.filter(
        (edge) => ids.has(edge.source) && ids.has(edge.target),
      ),
    };
  }

  #filterChain(
    chain: CallChain,
    projectDir: string,
    options: ExploreOptions,
  ): CallChain {
    const rootAllowed =
      !chain.root || this.#allowed(chain.root.file_path, projectDir, options);
    const callers = chain.callers.filter((entry) =>
      this.#allowed(entry.node.file_path, projectDir, options),
    );
    const callees = chain.callees.filter((entry) =>
      this.#allowed(entry.node.file_path, projectDir, options),
    );
    const ids = new Set([
      ...(rootAllowed && chain.root ? [chain.root.id] : []),
      ...callers.map((entry) => entry.node.id),
      ...callees.map((entry) => entry.node.id),
    ]);
    return {
      root: rootAllowed ? chain.root : null,
      callers,
      callees,
      edges: chain.edges.filter(
        (edge) => ids.has(edge.source) && ids.has(edge.target),
      ),
    };
  }

  #filterFlow(
    flow: ExecutionFlow,
    projectDir: string,
    options: ExploreOptions,
    limit: number,
  ): ExecutionFlow {
    const entries = flow.entries.filter((entry) =>
      this.#allowed(entry.node.file_path, projectDir, options),
    );
    const nodes = flow.flow
      .filter((entry) =>
        this.#allowed(entry.node.file_path, projectDir, options),
      )
      .slice(0, limit);
    const ids = new Set(nodes.map((entry) => entry.node.id));
    return {
      entries,
      flow: nodes,
      edges: flow.edges.filter(
        (edge) => ids.has(edge.source) && ids.has(edge.target),
      ),
    };
  }

  #filterDependencyTree(
    tree: readonly DependencyTreeNode[],
    projectDir: string,
    options: ExploreOptions,
  ): DependencyTreeNode[] {
    return tree.flatMap((entry) => {
      const children = this.#filterDependencyTree(
        entry.children,
        projectDir,
        options,
      );
      return this.#allowed(entry.node.file_path, projectDir, options)
        ? [{ ...entry, children }]
        : children;
    });
  }

  #filterEdges(
    edges: readonly EdgeInfo[],
    repository: GraphRepository,
    projectDir: string,
    options: ExploreOptions,
    allowVirtual = false,
  ): EdgeInfo[] {
    const cache = new Map<string, NodeInfo | null>();
    const node = (id: string) => {
      if (!cache.has(id)) {
        const result = repository.getNode(id);
        cache.set(id, result.isOk() ? result.value : null);
      }
      return cache.get(id) ?? null;
    };
    const allowedNode = (value: NodeInfo | null) =>
      Boolean(
        value &&
        ((allowVirtual && value.file_path.startsWith('<')) ||
          this.#allowed(value.file_path, projectDir, options)),
      );
    return edges.filter(
      (edge) =>
        allowedNode(node(edge.source)) && allowedNode(node(edge.target)),
    );
  }

  #allowed(
    filePath: string,
    projectDir: string,
    options: ExploreOptions,
  ): boolean {
    const path = filePath.startsWith(projectDir)
      ? filePath.slice(projectDir.length + 1).replaceAll('\\', '/')
      : filePath.replaceAll('\\', '/');
    let scopes = options.scope?.split(',').filter(Boolean) ?? [];
    const excludes = options.exclude?.split(',').filter(Boolean) ?? [];
    if (options.tier) {
      const tierFile = join(projectDir, '.vedh', 'tiers.json');
      if (existsSync(tierFile))
        try {
          const tiers = JSON.parse(readFileSync(tierFile, 'utf8')) as Record<
            string,
            string[]
          >;
          scopes = tiers[options.tier] ?? scopes;
        } catch {
          /* ignore invalid optional config */
        }
    }
    const matches = (pattern: string) =>
      new RegExp(
        `^${pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*\*/g, '§')
          .replace(/\*/g, '[^/]*')
          .replace(/§/g, '.*')}$`,
      ).test(path);
    return (!scopes.length || scopes.some(matches)) && !excludes.some(matches);
  }
}
