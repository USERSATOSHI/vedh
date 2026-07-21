# Calls and execution flow

## Trace one symbol

Resolve a node ID, then select the needed direction:

```bash
vedh explore . callers <node-id> 3
vedh explore . callees <node-id> 3
vedh explore . chain <node-id> 3
```

- `callers`: transitive executable relations entering the root
- `callees`: transitive executable relations leaving the root
- `chain`: both directions plus connecting edges

Results contain the root, related nodes, depth, and recorded edge metadata.
Preserve caller/callee direction in the answer. Do not reverse an edge merely
because the explanation reads more naturally in the opposite order.

## Find call sites by name

When the user knows a function name but not its node ID, use:

```bash
vedh explore . calls parseFile
```

This searches matching definitions and aggregates recorded incoming `calls` and
`constructor` edges. Check returned definitions when overloaded or duplicate
names exist.

## Trace repository entry flow

Use:

```bash
vedh explore . flow 5
```

Vedh detects package and repository entry points, then follows executable edges.
The response contains:

- `entries`: detected roots and their entry paths
- `flow`: flat nodes with depth and parent/call-site context
- `edges`: executable relationships among returned nodes

For a monorepo, group results by entry path or workspace package. Do not merge
independent package starts into one invented sequence.

## Choose calls versus general graph operations

- Use `callers`, `callees`, `chain`, and `flow` for execution questions.
- Use `deps` when imports, inheritance, implementations, returns, events, or
  other non-call relationships matter.
- Use `path` to establish connectivity, then inspect edge types before
  describing causality.
- Use `bfs ... calls` for a bounded call-only neighborhood when a full chain is
  too broad.

Call edges are based on statically indexed evidence. Dynamic dispatch,
reflection, generated code, unresolved imports, and runtime registration can
remain incomplete. State that limitation when it affects the conclusion.
