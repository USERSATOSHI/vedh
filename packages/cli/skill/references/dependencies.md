# Dependency trees

Use `deps` when the question includes more than executable calls. It follows all
indexed relationship types, including calls, imports, references, inheritance,
implementations, returns, and named events.

## Choose a direction

```bash
vedh explore . deps <node-id> both 3
vedh explore . deps <node-id> out 2
vedh explore . deps <node-id> in 2
```

- `out`: what the symbol depends on
- `in`: what depends on the symbol
- `both`: return dependencies and dependents separately

The final positional argument is traversal depth. Use `--limit` to bound
returned records:

```bash
vedh explore . deps <node-id> both 3 --limit 200
```

## Read the result

Each tree entry includes a node, `edge_type`, relevant edge metadata such as
call sites, and nested children. For `both`, Vedh returns `dependencies` and
`dependents` separately with truncation flags.

Traversal prevents cycles. A symbol reachable through several branches can
appear only under the first branch that reaches it, so the tree is a bounded
presentation rather than a list of every possible route.

## Scope dependencies

```bash
vedh explore . deps <node-id> both 3 --scope 'packages/core/**'
vedh explore . deps <node-id> in 2 --exclude 'tests/**,vendor/**'
vedh explore . deps <node-id> out 2 --tier runtime
```

Scope filters affect returned nodes and can promote an allowed descendant when
its filtered parent is removed. They do not rebuild or modify the stored graph.

## Choose the correct related operation

- Use `callers`, `callees`, or `chain` for executable call direction only.
- Use `neighbors` for immediate edges without nesting.
- Use `bfs` for a bounded subgraph containing nodes and edges.
- Use `path` to find one shortest connection between two resolved IDs.
- Use `deps` for the nested dependency/dependent view across all relationship
  types.

Check truncation before describing a dependency tree as complete. Static
analysis can also miss dynamic dispatch, reflection, generated code, or
unresolved imports.
