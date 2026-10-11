---
name: neon
description: Use when a Node.js backend uses Neon Postgres (serverless Postgres with connection pooling and branching).
---

# Neon Postgres Adapter

## Purpose

Translate the framework-neutral persistence contract onto Neon's serverless Postgres, where connections are pooled at the proxy and compute can suspend to zero between requests.

## Activate when

- Detect `@neondatabase/serverless` or `pg` with a `neon.tech` connection string in package.json or env.
- See `NEON_DATABASE_URL` or `DATABASE_URL=postgres://user:pass@ep-*.neon.tech`.

## Repository inspection

1. `package.json` — `@neondatabase/serverless` (HTTP/HTTPS driver) or `pg` (TCP driver).
2. Connection string — read `DATABASE_URL` from env (do not log it).
3. Pool config — `max: 1` for serverless, `max: 10-20` for long-running; Neon's pooler (PgBouncer) handles multiplexing.
4. Schema — Neon branches for preview environments; confirm the `main` branch vs preview branches.
5. `@neondatabase/serverless` — uses HTTP transport; queries are `sql` tagged template or `neon()` client.

## Decision rules

| Concern | Rule |
|---|---|
| Driver choice | Use `@neondatabase/serverless` on edge/serverless (no persistent TCP). Use `pg` on long-running Node. |
| Pool size | For serverless: 1 connection per request. Neon's pooler handles multiplexing at the proxy. For long-running: 10-20 max. |
| Prepared statements | Always use parameterized queries. `sql\`SELECT ...\`` is parameterized by default. |
| Branches | Preview branches are ephemeral; do not run destructive migrations on them. Merge schema changes via PR to `main`. |
| Cold start | Neon compute suspends after inactivity (~5s cold start on free, ~300ms on paid). Set up a keep-warm ping if latency is critical. |
| Connection mode | Use `?sslmode=require` for TLS. Use `pgbouncer=true` for transaction-mode pooling (no session features). |
| Migrations | Use `neonctl` or apply via `psql` against the connection string. Mark destructive migrations explicitly. |
| Backups | Neon PITR to any time in the retention window (typically 7 days free, 30 days paid). |

## Implementation procedure

1. Detect the driver: `@neondatabase/serverless` for serverless/edge, `pg` for long-running.
2. Build the connection: `neon(process.env.DATABASE_URL)` for HTTP, `new Pool({ connectionString, max: 1 })` for serverless TCP.
3. Run migrations with `neonctl` or `psql` against `main` branch.
4. Implement the persistence seam with parameterized queries.
5. Add a Testcontainers or live-Neon integration test.
6. Configure keep-warm (cron ping) if cold-start latency is critical.

## Failure modes

- Cold start 5s on the first request after inactivity → readiness probe times out, pod marked unready.
- Serverless function holds a `pg` pool with `max: 10` → 100 concurrent functions × 10 = 1000 connections, Neon refuses.
- Session-mode queries sent through PgBouncer transaction-mode pooler → `SET` statements lost between transactions.
- Preview branch used in production by mistake → ephemeral data, lost on next cleanup.
- No TLS on connection string → blocked by Neon.

## Verification

- Run `neonctl branches list` and `neonctl connection-string`.
- Confirm TLS in the connection URL.
- Run a load test from a cold start and measure the wake-up latency.
- Confirm the pool size matches the deployment shape (serverless = 1, long-running = 10-20).
- Source references: https://neon.tech/docs, https://neon.tech/docs/serverless/serverless-driver, https://neon.tech/docs/connect/connection-pooling, https://neon.tech/docs/guides/branching.
