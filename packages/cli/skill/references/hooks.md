# Named events, hooks, and call sites

## Understand event indexing

Vedh represents a named event as a virtual `event` node. Installed extensions
declare which calls fire, listen to, or dispatch events. The index then links
executable symbols to those event nodes with event-specific edges.

Core does not assume that WordPress or every event-bus API uses the same call
shape. If expected events are absent, inspect `.vedh/extensions.json` and the
selected extension's event-call definitions, then re-index.

## Find event fire and listener sites

```bash
vedh explore . hooks ready
vedh explore . hooks --limit 100
```

The optional pattern performs a substring match against event names. Results
include matching virtual event nodes and their connected edges. Inspect edge
direction and type to distinguish fire sites, listener registration, and
dispatch.

Scope filters apply to the real source symbols while retaining relevant virtual
event nodes:

```bash
vedh explore . hooks ready --scope 'packages/core/**'
```

Use this workflow:

1. Query the event name with `hooks`.
2. Identify fire/dispatch and listener edges by type.
3. Resolve connected source node IDs with `node` or `source`.
4. Follow callers/callees when the surrounding executable path matters.

Static indexing can miss dynamically constructed event names or callbacks that
an extension cannot resolve. State that limitation when results appear
incomplete.

## Find ordinary function call sites by name

```bash
vedh explore . calls parseFile
```

`calls` searches matching non-module, non-event definitions, then aggregates
incoming `calls` and `constructor` edges. Check the returned definitions when
names are overloaded or duplicated.

Use `hooks` for virtual named-event relationships. Use `calls` for ordinary
function or constructor targets. Use `callers <id>` when the exact target node
ID is already known.
