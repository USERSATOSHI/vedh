---
name: vedh
description:
  Use Vedh's local code graph for architecture, symbols, source, calls,
  execution flow, dependencies, paths, communities, events, and freshness.
  Trigger for questions about what code does, how it connects, or how a
  repository or monorepo is structured.
---

# Vedh code graph

Use Vedh's deterministic graph as repository evidence instead of guessing about
an indexed codebase.

## Core workflow

1. Run `vedh snapshot .` before substantial investigation; re-index if stale.
2. Resolve names with `vedh explore . search <query>` before structural queries.
3. Choose the narrowest operation that answers the question.
4. Read `node`, `source`, or `wiki` before describing implementation details.
5. Report names, paths, ranges, directions, and edge types.

Use `vedh explore` for structured JSON. Use `vedh query` only when a
natural-language shortcut helps.

## Choose an operation

| Question                            | Operation                                     |
| ----------------------------------- | --------------------------------------------- |
| Find a symbol or file               | `search <query>`                              |
| Inspect metadata, source, or docs   | `node <id>`, `source <id>`, `wiki <id>`       |
| Trace calls around one symbol       | `callers <id>`, `callees <id>`, `chain <id>`  |
| Find call sites from a known name   | `calls <name>`                                |
| Trace repository or monorepo starts | `flow [depth]`                                |
| Connect two symbols                 | `path <from-id> <to-id>`                      |
| Explore a bounded neighborhood      | `neighbors <id>` or `bfs <id> ...`            |
| Follow all dependency types         | `deps <id> [both\|in\|out] [depth]`           |
| Find architectural centers          | `god`                                         |
| Analyze subsystems and coupling     | `communities`, `community`, `cross-community` |
| Inspect named events                | `hooks [pattern]`                             |
| Check graph freshness               | `snapshot`                                    |

## Interpret evidence

- Use `callers`, `callees`, `chain`, and `flow` for executable direction. Use
  `deps` for all indexed relationship types.
- Treat `path` as graph connectivity; inspect its edges before claiming call
  direction or causality.
- Treat an empty result as no indexed evidence, not proof that no runtime
  relationship exists.
- Apply `--scope`, `--exclude`, `--tier`, and `--limit` when unrelated packages,
  tests, vendors, or generated code add noise.

Indexing writes local state. Run `vedh init .` and `vedh index .` when the user
requests setup or authorizes that mutation. Do not enable `--llm` or
`--generate-missing-docs` unless the user permits external model use.

## Load references as needed

- [setup.md](references/setup.md): indexing, configuration, and failures.
- [repos.md](references/repos.md): identity, storage, listing, and freshness.
- [node.md](references/node.md): search, metadata, source, and wiki.
- [graph.md](references/graph.md): neighbors, paths, BFS/DFS, and scopes.
- [dependencies.md](references/dependencies.md): dependency trees and direction.
- [execution.md](references/execution.md): calls, call sites, flow, and
  direction.
- [communities.md](references/communities.md): architecture, coupling, and
  domains.
- [hooks.md](references/hooks.md): events, fire sites, listeners, and
  extensions.
- [concept.md](references/concept.md): query, LLM synthesis, and concepts.
- [server.md](references/server.md): MCP, visualization, HTTP, and installation.
