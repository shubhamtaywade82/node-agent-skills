---
name: node-postgresql-persistence
description: Use when Node.js backend work changes PostgreSQL schemas, SQL queries, transactions, locks, indexes, connection pools, or persistence integrity.
---

# Node Postgresql Persistence

## Purpose

Use database-enforced integrity, explicit transaction ownership, measured query behavior, and pool sizing matched to database capacity. PostgreSQL is the source of truth; application-only invariants are defective.

## Activate when

- Changing database schemas, migrations, constraints, or indexes.
- Modifying transaction boundaries, isolation levels, or lock usage.
- Tuning query performance or rewriting hot-path queries.
- Sizing or diagnosing connection pools.
- Diagnosing deadlocks, lock contention, or pool exhaustion.
- Moving logic from application code into SQL constraints or triggers.

## Repository inspection

1. Migrations — find `migrations/`, `db/migrations/`, `prisma/migrations/`, or framework-specific dirs. Read the latest 5 to learn the migration style (expand/contract, blue/green, raw SQL, ORM-managed).
2. Constraints — read `schema.sql` or migration files to understand existing UNIQUE, CHECK, FOREIGN KEY, NOT NULL constraints.
3. Indexes — grep for `CREATE INDEX`, `CREATE UNIQUE INDEX` to find existing indexes on the hot tables.
4. SQL/query code — find raw SQL strings, query builder calls, or ORM calls. Trace the top 5 queries by frequency.
5. Transaction helpers — grep for `BEGIN`, `COMMIT`, `ROLLBACK`, `client.query("BEGIN")`, `tx`, `withTransaction`.
6. ORM/query builder — `prisma`, `drizzle`, `typeorm`, `sequelize`, `kysely`. Read the client setup file to find pool config.
7. Pool settings — find `max`, `min`, `idleTimeoutMillis`, `connectionTimeoutMillis` in pool config. Compare against database `max_connections`.
8. DB limits — read the cloud provider's connection limit per compute size or the self-hosted `postgresql.conf` `max_connections`.

## Decision rules

| Concern | Rule |
|---|---|
| Critical invariants | Enforce in DB constraints (UNIQUE, CHECK, FK, NOT NULL), not application code. |
| Transactions | Keep short. Never hold a transaction across an HTTP call, queue publish, or external I/O. |
| Connection per transaction | One client per transaction; release it in `finally`. |
| Pool size | Match to DB capacity, not process count. A 50-process deployment × 10 pool × 5 replicas = 2500 connections — most Postgres instances cannot serve that. |
| Locks | Default to row-level locks via `SELECT ... FOR UPDATE` on the rows you change. Avoid table-level locks in OLTP. |
| Idempotency | Mutations that may retry need a unique constraint on (idempotency_key, scope) and `ON CONFLICT DO NOTHING/UPDATE`. |
| N+1 | Detect with query logs in dev; fix with `JOIN`, `WITH`, or batched fetch. |
| Index decisions | Add an index only after `EXPLAIN ANALYZE` shows a seq scan on a hot path. Measure before and after. |
| Isolation | Default Read Committed. Use Serializable only for cases that need it; document why. |
| JSON columns | Use JSONB not JSON. Add GIN indexes on hot lookup paths. Validate shape at the boundary. |
| Migrations | Expand-then-contract: add column → backfill → switch reads → drop old. Never rewrite-in-place on a hot table. |

## Implementation procedure

1. State the invariant in plain English: "each order has at most one active payment per provider."
2. Choose the enforcement layer: DB constraint vs transaction vs application logic. Prefer DB constraint for uniqueness, transaction for multi-statement atomicity.
3. Write the migration as expand-only if running against a live DB. Add the constraint deferrable if it would break concurrent writes.
4. Implement the persistence seam: typed repository function that opens a transaction, performs the writes, commits, and releases the client.
5. Add a real Postgres integration test (not a mock) that exercises the happy path, the constraint-violation path, and the rollback path.
6. Run `EXPLAIN ANALYZE` on the hot-path query before and after your change. Save both plans.
7. Confirm pool size is still appropriate for the deployment shape.

## Failure modes

- Application-only uniqueness check + race condition = duplicate rows. The fix is a UNIQUE constraint, not a more careful check.
- Long transaction holding a lock across an HTTP call → connection pool exhaustion under load.
- Oversized pool: 100 processes × 20 pool = 2000 connections vs DB `max_connections=100`. The DB refuses new connections under load.
- ORM-generated N+1 queries hidden behind a `.findMany()` that loads relations lazily.
- `SELECT FOR UPDATE` on a hot row that all workers contend on — serialize access via an advisory lock or queue instead.
- Migration that adds a NOT NULL column with no default to a large table — Postgres rewrites the table and blocks writes.
- Constraint added without `NOT VALID` against a large table with existing bad rows — the migration fails halfway.
- Isolation level mismatch: Serializable used where Read Committed suffices, killing throughput.

## Verification

- Run migration forward + backward against a real Postgres (Testcontainers, docker-compose, or a ephemeral cloud DB).
- Run integration tests that hit a real DB: happy path, constraint violation, rollback, idempotent retry.
- Run `EXPLAIN ANALYZE` on hot queries; save before/after plans as evidence.
- Confirm `pg_terminate_backend` is not needed at the end of the test run (no leaked connections).
- Confirm the pool's `idle` count returns to zero after the test run.
- Source references: https://www.postgresql.org/docs/current/ddl-constraints.html, https://www.postgresql.org/docs/current/mvcc.html, https://node-postgres.com/features/pooling, https://www.postgresql.org/docs/current/runtime-config-connection.html.
