# Natural-language and multi-node concepts

## Ask a graph-backed question

```bash
vedh query . "what calls parseFile?"
# structured equivalent
vedh explore . query "what calls parseFile?"
```

Vedh recognizes common callers, callees, trace, neighbor, dependency, path,
flow, and overview questions deterministically. Other questions use lexical
name, path, documentation, and source evidence.

Prefer direct `explore` operations when exact structure or reproducible JSON
matters.

## Optional LLM synthesis

If `VEDH_LLM_URL` or `OPENAI_BASE_URL` is configured, Vedh can send retrieved
evidence to an OpenAI-compatible `/chat/completions` endpoint. `VEDH_LLM_MODEL`
and `OPENAI_API_KEY` configure the request.

Do not enable or describe the query as fully local when an external endpoint is
active. Retrieval remains lexical and graph-based; no vector database is
required.

## Explain several selected nodes

The visualizer HTTP API exposes a concept overlay:

```http
POST /api/concept
Content-Type: application/json

{
  "nodeIds": ["<node-a>", "<node-b>"],
  "question": "Explain how these symbols work together."
}
```

Resolve node IDs first and keep the selection focused. The response is
constrained by retrieved source and node evidence, but optional synthesis
follows the same external-endpoint rules as `vedh query`.
