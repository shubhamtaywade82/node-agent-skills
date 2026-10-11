# edge-worker — fixture Cloudflare Workers backend

A runnable Cloudflare Workers fixture demonstrating the **node-agent-skills** pack against an edge runtime. Exercises these skills end-to-end:

| Skill | Demonstrated by |
|---|---|
| `node-edge-runtime-foundations` | `wrangler.toml` + `src/index.js` — Workers runtime, no Node fs/net, isolate lifecycle, scheduled handler |
| `node-http-engineering` | `src/index.js` — `fetch` handler, one error boundary, typed `Env` |
| `node-runtime-validation` | `src/index.js` — zod at the boundary, `z.strict()`, bounded lengths |
| `node-async-concurrency` | `src/index.js` — `request.signal` propagated to the AI call |
| `node-llm-streaming` | `src/index.js` `summarize()` — SSE response, mid-stream errors, `[DONE]` sentinel |
| `node-llm-application-patterns` | `src/index.js` — Workers AI call, prompt template, `max_tokens` bound |
| `node-distributed-locks` | `src/index.js` `LeaderDO` — Durable Object as single-writer leader election with TTL lease |
| `node-production-runtime` | `src/index.js` — `/healthz` + `/readyz` probes, structured error envelope |
| `node-mcp-server-construction` | (pattern only) — the Workers runtime is JSON-RPC over fetch; same lifecycle rules apply |

## Run locally

```bash
# 1. Install deps
npm install

# 2. Start wrangler dev (requires Cloudflare account + wrangler login)
npx wrangler dev

# 3. Run the contract tests
npm test
```

## Verify against the skill pack

From the **pack root**:

```bash
# Detect adapters present in this fixture
node bin/skills.mjs detect-repo examples/edge-worker
# → should detect: wrangler (via cloudflare-workers adapter once version is detected),
#   zod, vitest

# Route an edge-deployment prompt
node bin/skills.mjs route "deploy a worker that streams LLM tokens via SSE" --repo examples/edge-worker
# → primary: node-llm-streaming or node-edge-runtime-foundations
```

## What this proves

The skills in `node-agent-skills` work for edge runtimes, not just long-running Node. The `summarize()` handler exercises `node-llm-streaming` with `request.signal` propagation — the canonical pattern for aborting an LLM call on client disconnect. The `LeaderDO` Durable Object exercises `node-distributed-locks` for single-writer leader election without an external lock service.

## Layout

```
examples/edge-worker/
├── package.json            # wrangler, @cloudflare/workers-types, zod, vitest
├── wrangler.toml           # bindings: KV, Durable Object, AI, cron trigger
├── src/
│   └── index.js            # fetch + scheduled handlers; LeaderDO class
├── test/
│   └── handler.contract.test.mjs  # 11 tests covering health, readyz, summarize
│                                     SSE stream, validation, DO acquire/release
└── README.md (this file)
```

## Not included (deliberately)

- Real Workers AI calls — the test mocks the `env.AI.run` binding so tests run without a Cloudflare account.
- Real KV/Durable Object state — the test uses in-memory stubs. Run `npx wrangler dev` for real bindings.
- Auth — would pull in Clerk/Auth0; see the `clerk` adapter.
- Frontend — the SSE stream can be consumed by any EventSource client.
