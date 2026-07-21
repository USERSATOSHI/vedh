# MCP, visualizer, HTTP, and skill installation

## Start MCP

```bash
vedh mcp .
```

This starts a stdio MCP server for the indexed project. It exposes search,
node/source/wiki retrieval, callers/callees, paths, flow, BFS/DFS, dependency
trees, communities, named events, call sites, and freshness.

Use connected MCP tools when available. Use `vedh explore` when direct
structured shell output is more practical.

## Start the visualizer

```bash
vedh viz .
vedh viz . --host 127.0.0.1 --port 3001
```

The default bind is `0.0.0.0:3001`; choose loopback when remote access is
unnecessary. The visualizer supports community sectors, package starts, call
flow, neighborhood focus, paths, source, wiki, and graph filtering.

Important HTTP routes include:

- `GET /api/health`, `/api/graph`, `/api/search`
- `GET /api/node/:id`, `/api/subgraph/:id`
- `GET /api/execution/flow`, `/api/communities`, `/api/report`
- `POST /api/query`, `/api/concept`

Use CLI or MCP output when the final answer needs reproducible evidence rather
than an interactive view.

## Install the skill for an agent harness

```bash
vedh skill install
vedh skill install --agent claude --scope project
vedh skill install --agent codex --scope user
vedh skill install --agent opencode --scope global
vedh skill install --agent pi --scope project
vedh skill install --agent all --scope global
```

The interactive installer asks for Claude Code, Codex, OpenCode, Pi, or the
shared Agent Skills location, then asks for project, user, or global scope. The
installed skill contains only harness-neutral `SKILL.md` and Markdown
references.
