---
name: cloudflare-workers
description: Use when a Node.js-style backend targets Cloudflare Workers runtime, with Workers AI, Durable Objects, KV, R2, D1, Queues, or Hyperdrive.
---

# Cloudflare Workers Adapter

## Purpose

Translate the framework-neutral HTTP, persistence, and queue contracts onto the Workers runtime, where there is no Node.js process, no `Buffer` by default, no `node:fs`, no `node:net`, and the isolate may be killed between requests.

## Activate when

- Detect `wrangler` in `package.json` `devDependencies` or in `wrangler.toml`/`wrangler.jsonc` at the repo root.
- See `export default { fetch, scheduled, email }` in any `src/index.ts`.
- See bindings `env.DB` (D1), `env.KV` (KV), `env.BUCKET` (R2), `env.QUEUE` (Queues), `env.HYPERDRIVE` (Hyperdrive).

## Repository inspection

1. `wrangler.toml` / `wrangler.jsonc` — read `name`, `main`, `compatibility_date`, `compatibility_flags` (`nodejs_compat`), and the binding declarations.
2. `package.json` — `dependencies` for `@cloudflare/workers-types`, `wrangler`, `hono`, `itty-router`. `engines.node` is irrelevant; target the Workers runtime.
3. Entry point — find the `export default { ... }` file. Map every entry (`fetch`, `scheduled`, `email`, `queue`, `tail`).
4. Bindings — list every `env.X` reference. Match each to its declared binding type in `wrangler.toml`.
5. Durable Objects — grep for `DurableObject`, `export class`. List the DO classes and their migrations.
6. Limits — confirm the worker fits the CPU limit (10ms CPU on free, 30s on paid), subrequest cap (50 free / 1000 paid), and script size (3MB free / 10MB paid).

## Decision rules

| Concern | Rule |
|---|---|
| Runtime | No `node:fs`, `node:net`, `node:child_process`, no `Buffer` by default (enable `nodejs_compat`). Use `crypto.subtle` for hashing. |
| Lifecycle | The isolate may be killed at any time between requests. Do not hold state in module scope; use Durable Objects or KV. |
| Subrequests | Bound outbound fetches to the limit; batch when possible. Use `connect()` from `cloudflare:sockets` for raw TCP. |
| Persistence | D1 (SQL), R2 (S3-compatible object storage), KV (eventually consistent reads), Hyperdrive (cached Postgres connection pooling). |
| Queues | Producers write to `env.QUEUE.send()`; consumers implement `queue(queue, batch)`. Idempotency required — at-least-once delivery. |
| Secrets | Use `wrangler secret put`; never hard-code. Read via `env.SECRET_NAME`. |
| Durable Objects | Single-threaded per DO instance; use for strong consistency, leader election, single-writer patterns. Not for high-cardinality data. |
| Cron | `scheduled` handler runs on a cron schedule. Bound the work to the CPU limit; offload heavy work to Queues. |
| Email | `email` handler receives `EmailMessage` and `send_email` binding. Do not parse raw MIME by hand; use `postal-mime`. |
| Static assets | Use Workers Assets (`wrangler assets`) or `@cloudflare/kv-asset-handler` for SPA serving. |
| Observability | Workers Logs (scoped tail), `console.log` to `wrangler tail`. Use `env.CLOUDFLARE_ANALYTICS` or Workers Analytics Engine for metrics. |
| Workers AI | `env.AI.run('@cf/meta/llama-3-8b-instruct', { prompt })`. Bound the input size; gate concurrency. |
| Compatibility | Set `compatibility_date` recent; enable `nodejs_compat_v2` if Buffer/process are needed. |

## Implementation procedure

1. Confirm the runtime: read `wrangler.toml`, confirm `compatibility_date` and `compatibility_flags`.
2. Map each binding `env.X` to its type. Write the typed `Env` interface and use it as the handler's `env` parameter type.
3. Implement the `fetch` handler: parse + validate input, route to application code, return a `Response`. Map errors to a stable envelope.
4. For persistence: D1 (`env.DB.prepare('SQL').bind(...).run()`) or Hyperdrive (`env.HYPERDRIVE` as a `fetch`-compatible Postgres URL — for `pg` driver).
5. For queues: producer uses `env.QUEUE.send(body)`; consumer implements `async queue(queue, batch, env)` with idempotent processing.
6. For Durable Objects: `export class X extends DurableObject { ... }`; migrate in `wrangler.toml` `[[migrations]]`; client `env.X.get(id).fetch(...)`.
7. Add `vitest` with `@cloudflare/vitest-pool-workers` for unit + integration tests against bindings.

## Failure modes

- Holding a DB connection in module scope → isolate evicts, connection dies, requests fail.
- `Buffer.from(...)` without `nodejs_compat` → ReferenceError.
- `fetch()` to an external API per request, no retries → 50 subrequest limit exhausted under load.
- KV used as a transactional store → it is eventually consistent; concurrent writers may overwrite.
- Durable Object used for high-cardinality data (one DO per user) → partition count explodes, cold-start cost dominates.
- Cron handler that runs > 30s CPU → killed mid-work, no recovery.
- `wrangler secret` not set in CI → deployment succeeds, runtime crashes when the binding is read.
- Email handler that parses raw MIME by hand → broken on edge cases (multipart, encoding).

## Verification

- Run `wrangler dev` locally; hit every endpoint; confirm responses.
- Run `vitest` with `@cloudflare/vitest-pool-workers`; exercise the handler against real D1/KV/R2 bindings.
- Run `wrangler deploy --dry-run`; confirm the script builds and the size is within the limit.
- Test idempotency: send the same queue message twice; confirm one side effect.
- Test Durable Object: send two concurrent requests to the same DO ID; confirm they serialize.
- Inspect `wrangler tail` during a load test; confirm no uncaught exceptions.
- Source references: https://developers.cloudflare.com/workers/, https://developers.cloudflare.com/d1/, https://developers.cloudflare.com/r2/, https://developers.cloudflare.com/kv/, https://developers.cloudflare.com/queues/, https://developers.cloudflare.com/durable-objects/, https://developers.cloudflare.com/hyperdrive/, https://developers.cloudflare.com/workers/ai/, https://developers.cloudflare.com/email-routing/.
