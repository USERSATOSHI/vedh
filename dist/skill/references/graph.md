# Graph traversal and paths

## Inspect adjacent relationships

```bash
vedh explore . neighbors <node-id>
```

`neighbors` returns edges touching the node. Read each edge's `source`,
`target`, `type`, weight, and metadata rather than treating every adjacent node
as an outgoing dependency.

## Traverse a bounded neighborhood

```bash
vedh explore . bfs <node-id> 2 bfs 100
vedh explore . bfs <node-id> 3 dfs 150 calls,imports
```

Arguments are node ID, depth, traversal mode, result limit, and optional
comma-separated edge types.

- Use BFS to inspect all nearby symbols level by level.
- Use DFS to follow branches deeply before exploring siblings.
- Start with depth 1 or 2 and add edge filters when the neighborhood is noisy.
- Treat the returned nodes and edges as a subgraph, not an execution sequence.

## Find a path between symbols

Resolve both IDs with search, then run:

```bash
vedh explore . path <from-id> <to-id>
```

The result is a shortest connection in the indexed graph. It is not
automatically a directed call path. Inspect the corresponding relationships or
switch to callers/callees before claiming causality.

An empty path means no indexed connection was found. Dynamic dispatch,
reflection, generated code, and unresolved imports can remain invisible.

## Scope graph queries

```bash
vedh explore . bfs <node-id> 2 bfs 100 --scope 'packages/core/**'
vedh explore . neighbors <node-id> --tier runtime --limit 50
```

- `--scope`: comma-separated inclusion globs
- `--exclude`: comma-separated exclusion globs
- `--tier`: named scope from `.vedh/tiers.json`
- `--limit`: maximum returned records

`*` matches one path segment and `**` spans directories. These filters affect
query output, not the stored index.
