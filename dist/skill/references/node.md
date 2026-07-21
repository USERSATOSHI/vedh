# Symbol search, metadata, source, and wiki

## Resolve a node ID

```bash
vedh explore . search ParserEngine
vedh explore . search "packages/core graph"
```

Search covers names, paths, documentation, summaries, and indexed source.
Results are wrapped in `results`. Select by name, kind, path, and domain; do not
assume the first same-named symbol is correct.

Apply `--scope`, `--exclude`, `--tier`, or `--limit` when necessary:

```bash
vedh explore . search Router --scope 'packages/core/**' --limit 25
```

## Read node metadata

```bash
vedh explore . node <node-id>
```

Node metadata includes the symbol name, kind, file path, parent, hierarchy,
metadata, and exact source coordinates. Lines are one-based, columns are
zero-based, and source offsets are zero-based JavaScript UTF-16 offsets with an
exclusive end.

Use the exact path and range when citing a symbol. Search again if an ID no
longer resolves after re-indexing.

## Read exact source

```bash
vedh explore . source <node-id>
```

Vedh uses inline indexed source for small symbols and falls back to the recorded
file range when necessary. If source disagrees with the checkout, check
freshness and re-index.

## Read generated documentation

```bash
vedh explore . wiki <node-id>
```

Wiki results can be null. Vedh generates symbol wiki pages only when a
declaration has a real source documentation comment; it does not synthesize
generic fallback pages from graph metadata.

Use `node` and `source` as primary evidence. Use `wiki` as additional
author-provided context.
