# Setup and indexing

## Initialize and index

Initialize project-local configuration, then build the graph:

```bash
vedh init .
vedh index .
```

`vedh init` creates `.vedh/config.json` with local storage enabled. `vedh index`
discovers supported files, parses symbols and relationships, computes hierarchy,
communities, and domains, generates documentation-backed wiki pages, and
populates lexical search.

Indexing is incremental. It reuses content-hash parse results and removes data
for deleted or renamed files. Force a clean parse-cache rebuild only when
necessary:

```bash
vedh index . --full
```

Use Vedh's long indexing options:

```bash
vedh index . --llm
vedh index . --generate-missing-docs
vedh index . --llm --imports-exports-only
```

LLM enrichment is optional. `--generate-missing-docs` implies enrichment. Keep
deterministic indexing as the default.

## Project configuration

Use `.vedh/config.json` for deterministic settings:

```json
{
  "local": true,
  "domains": {
    "core": ["packages/core/**"],
    "cli": ["packages/cli/**"]
  }
}
```

Named query scopes live separately in `.vedh/tiers.json`.

Vedh respects `.gitignore`, `.vedhignore`, and the legacy `.michiignore`
compatibility file during discovery.

## Failure handling

- If no database is available, initialize and index the exact project path used
  by later queries.
- If a node is missing, search again rather than inventing an ID; the index may
  have changed.
- If results omit recent edits, re-index and repeat the query.
- If Node fails to load the native SQLite addon, verify the supported Node
  runtime and addon ABI before changing graph code.
- If an optional extension fails, inspect `.vedh/extensions.json` and the
  installed package before blaming core discovery.
