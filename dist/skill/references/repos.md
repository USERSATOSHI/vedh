# Repositories, storage, and freshness

## List known repositories

```bash
vedh explore . repos
```

This lists known repository hashes, project pointers when available, and
database paths under the active Vedh data directory.

Print the hash for a resolved project path with:

```bash
vedh explore . hash
```

Vedh hashes the resolved absolute project path. Query with the same project path
used for indexing.

## Storage locations

- Default database: `~/.vedh/<repoHash>/kb.sqlite`
- Project-local database when `local` is true: `<project>/.vedh/kb.sqlite`
- Global data-root override: `VEDH_DATA_DIR`
- Local directory override: `dbPath` in `.vedh/config.json`

When local storage is enabled, Vedh also maintains a global project pointer so
`repos` can identify the checkout.

## Check freshness

```bash
vedh snapshot .
# structured equivalent
vedh explore . snapshot
```

Inspect:

- `currentCommit` and indexed commit information
- `stale`: the indexed commit or parser schema no longer matches
- `schemaStale`: the parser schema changed since indexing
- indexed node and file counts

Re-run `vedh index .` before trusting stale evidence. Freshness compares
committed state, so uncommitted changes made after indexing can still require a
new index even when the commit hash matches.

If `repos` is empty, no repository has been indexed under the selected data
directory. If a database appears missing, verify the project path,
`.vedh/config.json`, and `VEDH_DATA_DIR` before rebuilding.
