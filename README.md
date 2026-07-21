# Vedh

Vedh is a local code knowledge graph for developers and AI coding agents. It
parses source with Tree-sitter, stores symbols and deterministic relationships
in SQLite, and exposes the graph through a human CLI, compact JSON exploration
commands, MCP, and a browser visualizer.

Vedh does not require embeddings or an LLM. Optional OpenAI-compatible synthesis
can be enabled for natural-language answers; retrieval remains lexical and
graph-based.

## What is indexed

- Symbol, module, and virtual named-event nodes.
- Containment, call, constructor, import, export, inheritance, implementation,
  return-type, event-fire, event-listener, and event-dispatch edges.
- Exact source ranges, inline source for small symbols, existing doc comments,
  call-site arrays, hierarchy, domains, and Louvain communities.
- Repository commit, file/node counts, parser schema version, content-hash
  manifest, and cached parse results.

Built-in languages are JavaScript/TypeScript, Python, and PHP. Other languages
and framework-specific behavior belong in extensions built with
`@vedh/extension-sdk`; see `examples/extensions/go` for a language example.
Named pub/sub APIs are configured by an event extension, so WordPress support
can be shipped separately without framework knowledge in core.

## Installation

Vedh requires Node.js 24 and can be installed directly from the public Git
repository. A version tag is recommended so the installed CLI is reproducible.

```bash
# npm
CXXFLAGS='-std=gnu++20' npm install --global \
  --allow-scripts=better-sqlite3,tree-sitter,tree-sitter-javascript,tree-sitter-php,tree-sitter-python,tree-sitter-typescript \
  'git+https://github.com/usersatoshi/vedh.git#v0.1.0'

# Bun
CXXFLAGS='-std=gnu++20' bun add --global \
  'git+https://github.com/usersatoshi/vedh.git#v0.1.0'
```

The tagged repository includes the prebuilt CLI, parser worker, agent skill, and
visualizer assets. Users do not need to clone the repository or install the
monorepo workspaces. The C++20 flag is required when Tree-sitter compiles
against Node.js 24; current npm versions also require explicit approval before
native dependency install scripts can run.

## Indexing

```bash
vedh init .
vedh index .
vedh index . --full
vedh snapshot .
```

Indexing is incremental by default. Vedh respects `.gitignore`, `.vedhignore`,
and `.michiignore`, detects workspace packages, hashes source contents, reuses
cached parse results, removes deleted/renamed symbols and edges, rebuilds on
schema changes, and records the indexed Git commit. Parsing uses bounded worker
threads for sufficiently large built-in-language batches; custom adapters safely
fall back to the main process.

## Querying

```bash
vedh search ParserEngine
vedh query . "what calls parseFile?"
vedh explore . search ParserEngine
vedh explore . callers <node-id>
vedh explore . callees <node-id>
vedh explore . flow 5
vedh explore . path <from-id> <to-id>
vedh explore . bfs <node-id> 2 dfs 100 calls,imports
vedh explore . deps <node-id> both 3
vedh explore . communities
vedh explore . community 0
vedh explore . cross-community 0 1
vedh explore . hooks ready
vedh explore . calls parseFile
vedh explore . source <node-id>
vedh explore . wiki <node-id>
```

List operations accept `--scope`, `--exclude`, `--tier`, and `--limit`. Named
tiers live in `.vedh/tiers.json`.

`vedh query` uses FTS5/name/path/source/doc retrieval. If `VEDH_LLM_URL` (or
`OPENAI_BASE_URL`) is set, Vedh sends the retrieved evidence to an
OpenAI-compatible `/chat/completions` endpoint. Set `VEDH_LLM_MODEL` and
`OPENAI_API_KEY` as needed. No vector database is used.

## Agent and visual integration

```bash
vedh mcp .
vedh viz . --port 3001
vedh skill install
```

The MCP server exposes 17 tools for search, node/source/wiki access,
callers/callees, paths, execution flow, BFS, dependency trees, communities,
hooks, call sites, and freshness. The MCP launcher and canonical agent skill in
`packages/cli/skill` are included in this repository.

`vedh skill install` opens an interactive arrow-key selector for the agent
(Claude Code, Codex, OpenCode, Pi, or all supported agents) and a second
selector for the installation scope. Choosing **all** uses the shared Agent
Skills locations: project scope writes to `.agents/skills/vedh`, while
user/global scope writes to `~/.agents/skills/vedh`. This is the portable
location recognized by OpenCode and usable by Codex and Pi when their skill
search paths include the shared Agent Skills directory. Choosing a specific
agent uses that agent's native directory instead.

The scope can also be supplied non-interactively with
`vedh skill install --agent codex --scope project` or
`vedh skill install --agent all --scope global`.

The visualizer provides a Canvas graph and HTTP API:

- Pan/zoom navigation, draggable nodes, fit/reset controls, labels, tooltips,
  and PNG export.
- Semantic node shapes for classes, functions, methods, variables, modules,
  interfaces, types, and events; directed arrows and zoom-aware edge labels.
- Search plus symbol-kind, edge-type, domain, community, and hierarchy filters.
- Community-aware layout/coloring with inferred package/symbol names, two-hop
  neighborhood focus, and highlighted shortest-path exploration.
- Node overview, exact source, source-documentation wiki, and relationship
  panels.

- `GET /api/graph`, `/api/node/:id`, `/api/subgraph/:id`, `/api/search`
- `GET /api/execution/flow`, `/api/communities`, `/api/report`, `/api/health`
- `POST /api/query`, `/api/concept`

## Storage

The default database is `~/.vedh/<repoHash>/kb.sqlite`. With `{ "local": true }`
in `.vedh/config.json`, it is stored at `.vedh/kb.sqlite`. SQLite contains
repository snapshots, nodes, edges, wiki pages, the incremental file manifest,
parse cache, and FTS5 search index.

Wiki generation is documentation-driven: Vedh creates a symbol page only when
the declaration has a real source documentation comment. It does not synthesize
fallback pages from kind, path, hierarchy, or relationship data that is already
available elsewhere in the graph.

Node rows persist one-based start/end lines, zero-based start/end columns, and
zero-based JavaScript UTF-16 source offsets (`offset_start`, inclusive;
`offset_end`, exclusive). Relation call sites carry the same precise coordinates
in edge metadata, so graph consumers do not need the parse cache to locate
source.

Optional deterministic index settings live in `.vedh/config.json`:

```json
{
  "local": true,
  "sourceInlineMaxLines": 40,
  "domains": {
    "parser": ["packages/parser/**"],
    "interfaces": ["packages/extension-*/**"]
  }
}
```

`VEDH_SOURCE_INLINE_MAX_LINES` overrides the configured inline-source limit.

## Development

Vedh targets Node 24.

```bash
bun install
bun run typecheck
bun run build
bun run test
```
