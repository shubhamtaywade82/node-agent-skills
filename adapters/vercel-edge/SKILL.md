---
name: vercel-edge
description: Use when a Node.js-style backend targets Vercel Edge Functions, Edge Config, Edge KV, or the Vercel Edge Runtime.
---

# Vercel Edge Functions Adapter

## Purpose

Translate the framework-neutral HTTP/API contract onto the Vercel Edge Runtime, which is Web-APIs-only (no Node fs/net/Buffer by default), cold-start-bounded, and region-distributed.

## Activate when

- Detect `next` in `package.json` with `runtime: "edge"` in any route file.
- See `export const config = { runtime: "edge" }` in a route handler.
- See `@vercel/edge-config`, `@vercel/kv`, `@vercel/postgres` in dependencies.

## Repository inspection

1. `next.config.js` / `next.config.mjs` — read `experimental.runtime`, edge flags, and output mode (`"standalone"` vs `"export"`).
2. `package.json` — `next` version, `@vercel/edge-config`, `@vercel/kv`, `@vercel/postgres`. `engines.node` is informational only.
3. Route files — find `app/*/route.ts`, `pages/api/*.ts` with `runtime: "edge"` or `export const runtime = "edge"`.
4. Middleware — `middleware.ts` runs on the edge; confirm it does not pull heavy deps (Prisma, full DB driver).
5. Env — `EDGE_CONFIG`, `KV_URL`, `KV_REST_API_URL`, `POSTGRES_URL`. Confirm secrets are not prefixed `NEXT_PUBLIC_`.

## Decision rules

| Concern | Rule |
|---|---|
| Runtime | No Node.js APIs (no `fs`, no `net`, no `Buffer` by default). Web APIs only: `fetch`, `crypto.subtle`, `TextEncoder`, `Request`, `Response`, `ReadableStream`. |
| Cold start | Bound to ~50ms; lazy-load optional dependencies. Top-level imports must be lightweight. |
| Edge Config | Read-only at runtime; write via Vercel API or CLI. Use for feature flags, kill switches, country-block lists. |
| Edge KV | Eventually consistent. Use for sessions, rate-limit counters. Not for transactional data. |
| @vercel/postgres | Pooled Postgres over the edge; uses Hyperdrive-style connection pooling. Use prepared statements. |
| Time | Use `performance.now()` for monotonic; `Date.now()` works but may be unreliable across regions. |
| Secrets | Use `process.env.X` (Vercel injects at runtime). Never hard-code. Never prefix `NEXT_PUBLIC_`. |
| Streaming | Edge supports `ReadableStream`; use for LLM token streaming. |
| Region | Edge runs at the nearest POP; DB-backed requests still pay round-trip to the DB region. Co-locate the DB. |
| Timeout | Default 25s on Edge Pro; longer requires switching to Node.js runtime. |
| Abort | Pass `AbortSignal` from the request; downstream calls must respect it. |

## Implementation procedure

1. Confirm the runtime: read `next.config` and route files; confirm edge runtime.
2. Map every env var to its binding. Confirm none are `NEXT_PUBLIC_` unless they are safe to ship to the client.
3. Implement the route handler: `export async function GET(request: Request) { ... }`. Parse + validate input, return a `Response`.
4. For persistence: `@vercel/postgres` for SQL, `@vercel/edge-config` for flags, `@vercel/kv` for sessions.
5. For streaming: return `new Response(stream, { headers: { "Content-Type": "text/event-stream" } })`.
6. Add a vitest test with `@edge-runtime/vitest` to exercise the handler.

## Failure modes

- Pulling in a heavy dependency (e.g., Prisma) at the top level → cold start 500ms, edge timeout.
- Using `fs.readFileSync` at request time → runtime error.
- Edge KV used as a transactional store → eventually consistent writes overwritten.
- Long-running LLM call exceeds the 25s timeout on the edge → 504.
- Secret prefixed `NEXT_PUBLIC_` → shipped to client.

## Verification

- Run `next dev` locally with `runtime: "edge"`; confirm the route works.
- Run `next build` and inspect the bundle size for the edge route.
- Use `vercel env ls` to confirm secrets are set.
- Inspect `vercel logs` during a load test; confirm no edge timeouts.
- Source references: https://vercel.com/docs/functions/edge-functions, https://vercel.com/docs/edge-config, https://vercel.com/docs/kv, https://vercel.com/docs/storage/vercel-postgres, https://nextjs.org/docs/app/api-reference/edge.
