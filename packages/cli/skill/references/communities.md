# Architecture, communities, and coupling

## Find high-impact nodes

```bash
vedh explore . god --limit 25
```

God nodes are high-centrality architectural starting points. They are not
automatically defects or runtime entry points. Inspect their source and
relationships before assigning responsibility.

## List detected communities

```bash
vedh explore . communities --limit 50
```

Vedh detects communities from graph topology. Use representative nodes, member
paths, size, and cohesion to infer subsystem names instead of presenting opaque
numeric IDs.

List one community's members:

```bash
vedh explore . community <community-id> --limit 200
```

## Explain coupling between communities

```bash
vedh explore . cross-community <community-a> <community-b> --limit 100
```

Inspect source, target, and edge type for each cross-community relationship.
Distinguish intentional public boundaries from accidental coupling. Scope away
tests, vendors, or generated files if they dominate the result.

## Compare configured domains with communities

Domains in `.vedh/config.json` express intended path ownership. Communities
express observed structural clustering. Compare them to find misplaced symbols
or cross-layer dependencies.

Changing domain patterns requires re-indexing because Vedh stores the selected
domain in node metadata and lexical search.

## Analyze monorepos

1. Use `flow` to identify each workspace package start.
2. Use `--scope 'packages/<name>/**'` for package-local questions.
3. List repository-wide communities for emergent boundaries.
4. Inspect cross-community edges before claiming packages are tightly coupled.
5. Separate import/build dependencies from runtime call flow.

When reporting counts, distinguish supported files, indexed nodes, dependency
edges, and total graph edges.
