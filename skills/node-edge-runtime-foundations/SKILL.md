---
name: node-edge-runtime-foundations
description: Use when designing or changing a Node.js-style backend that targets an edge runtime (Cloudflare Workers, Vercel Edge, Deno Deploy, Bun) instead of long-running Node.
---

# Node Edge Runtime Foundations

## Purpose

Edge runtimes (Cloudflare Workers, Vercel Edge, Deno Deploy, Bun) have a different contract from long-running Node: short-lived isolates, Web APIs only, no `node:fs`/`node:net`/`Buffer`, cold-start budget, region distribution.

## Activate when

- Deploying to Cloudflare Workers, Vercel Edge, Deno Deploy, or Bun.
- Migrating a Node backend to the edge.
- Diagnosing cold-start latency, runtime errors (no `fs`), or regional behavior.
- Choosing between edge and Node for a given endpoint.

## Repository inspection

1. Runtime config — `wrangler.toml` (Workers), `next.config.js` with edge routes, `deno.json` (Deno), `bunfig.toml` (Bun).
2. `package.json` — `engines.node` may be absent; runtime-specific packages (`@cloudflare/workers-types`, `@vercel/edge-config`).
3. Entry points — `export default { fetch, scheduled, email }` (Workers), `app/*/route.ts` with `runtime: "edge"` (Vercel).
4. Module imports — grep for `node:fs`, `node:net`, `node:child_process`, `Buffer.from`. Confirm none on the edge path; use `nodejs_compat` if needed.
5. Bindings — `env.DB`, `env.KV`, `env.BUCKET` (Workers); `process.env.X` (Vercel).
6. Limits — Workers: 10ms CPU (free), 30s (paid), 50 subrequests (free), 1000 (paid). Vercel Edge: 25s timeout.

## Decision rules

| Concern | Rule |
|---|---|
| Runtime API | Web APIs only: `fetch`, `crypto.subtle`, `TextEncoder`, `Request`, `Response`, `ReadableStream`. Enable `nodejs_compat` for `Buffer`/`process` (Workers) when unavoidable. |
| Cold start | Bound ≤ 50ms. Lazy-load optional dependencies. Top-level imports must be lightweight. |
| Isolate lifecycle | The isolate may be killed between requests. Do not hold state in module scope; use KV, Durable Objects, or external state. |
| Persistence | D1 (Workers SQL), R2 (object storage), KV (eventually consistent), Hyperdrive (cached Postgres pool), Turso (Deno), Neon (serverless Postgres). |
| Subrequests | Bound outbound `fetch`es per request. Workers free: 50; paid: 1000. |
| Timeouts | Workers: 30s CPU on paid. Vercel Edge: 25s. Deno Deploy: varies. Bun: depends on host. |
| Region | Edge runs at the nearest POP. DB-backed requests pay round-trip to the DB region. Co-locate the DB. |
| Secrets | Workers: `wrangler secret put`. Vercel: `vercel env`. Never hard-code. |
| Streaming | Edge supports `ReadableStream`; use for LLM token streaming. |
| Auth | JWT verification via `jose` (works on edge). Session via KV or Edge Config. |
| Cron | Workers `scheduled` handler. Bound work to the CPU limit; offload heavy to Queues. |
| Choose edge vs Node | Edge: small, fast, global, low-compute. Node: heavy, regional, full API, long-lived. Default to Node for heavy work. |

## Implementation procedure

1. Confirm the runtime: read `wrangler.toml` / `next.config` / `deno.json` / `bunfig.toml`.
2. Audit imports for Node-specific APIs (`fs`, `net`, `child_process`, `Buffer`). Replace with Web APIs or external service calls.
3. Define the bindings/env. Map each `env.X` to its type. Use a typed `Env` interface.
4. Implement the `fetch` handler: parse + validate input, return a `Response`. Map errors to a stable envelope.
5. For persistence: pick the runtime-native store (D1, R2, KV for Workers; `@vercel/postgres` for Vercel Edge).
6. For streaming: return `new Response(stream, { headers: { "Content-Type": "text/event-stream" } })`.
7. Add a runtime-specific test (Vitest + `@cloudflare/vitest-pool-workers` for Workers, `@edge-runtime/vitest` for Vercel Edge).

## Failure modes

- `fs.readFileSync` at request time → runtime error on edge.
- `Buffer.from(...)` without `nodejs_compat` → ReferenceError on Workers.
- Holding DB connection in module scope → isolate evicts, connection dies.
- Heavy computation (image processing, JSON.parse on 10MB) → CPU limit exceeded, request killed.
- Top-level `await` on a slow external service → cold start 5s, edge timeout.
- 50 subrequest limit exhausted under load → 429 from Workers runtime.
- DB-backed request on edge → 200ms round-trip per query (DB in another region).
- KV used as a transactional store → eventually consistent writes overwritten.

## Verification

- Run `wrangler dev` (Workers) or `next dev` with `runtime: "edge"` (Vercel) locally; confirm every endpoint works.
- Run the runtime-specific test suite (vitest + pool).
- Run `wrangler deploy --dry-run` (Workers) or `next build` (Vercel); confirm the bundle is within size limits.
- Test cold start: idle for 5 min, hit the endpoint, measure latency.
- Test regional behavior: hit the endpoint from multiple regions; confirm response includes the region.
- Test streaming: confirm LLM tokens stream to the client.
- Source references: https://developers.cloudflare.com/workers/, https://vercel.com/docs/functions/edge-functions, https://deno.com/deploy/docs, https://bun.sh/docs, https://nodejs.org/api/globals.html#fetch.
