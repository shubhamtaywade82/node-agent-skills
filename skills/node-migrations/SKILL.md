---
name: node-migrations
description: Use when changing production database schemas, writing migrations, backfilling data, removing columns, or coordinating schema changes across multiple application versions.
license: MIT
---

# Database Migrations

## Purpose

Treat migrations as compatibility work, not merely schema editing. Production deployments may run old and new application versions concurrently: every migration must be safe to execute while the previous application version is still serving traffic, and the new schema must work for both versions. The deploy is a rolling window, not an instant.

## Activate when

- Adding, removing, or renaming columns, indexes, constraints, tables, or enum values.
- Backfilling existing rows.
- Deploying schema changes with zero or low downtime requirements.

## Boundary with related skills

- Use `node-migrations` for schema change sequencing and rollout compatibility.
- Use `node-database-migrations-production` for the production runbook mechanics (monitoring, lock timeouts, checkpoints) in this pack.
- Use `node-zero-downtime` for the process lifecycle of the deploy surrounding the migration.
- Use `node-transactions` for backfill batching semantics.

## Repository inspection

Inspect migration tooling (Knex/Drizzle/Prisma/node-pg-migrate), deploy order, rollback or roll-forward convention, production database size, lock duration, concurrent application versions, and migration history. Establish whether migrations run as deploy hooks or jobs, and whether old app versions can still run against the HEAD schema.

## Decision rules

| Concern | Rule |
|---|---|
| Compatibility | New schema must work with the currently deployed app before new app rollout. |
| Destructive change | Split destructive changes until all readers/writers are removed. |
| Backfill | Batch large backfills; avoid holding long locks. |
| Indexes | Use online/concurrent mechanisms where database/version supports them and traffic requires them. |
| Defaults | Verify database-specific rewrite and lock behavior before rollout. |
| Rollback | Prefer roll-forward-compatible recovery; do not assume arbitrary DDL rollback is safe. |

Change classification determines the path:

| Class | Example | Path |
|---|---|---|
| Additive | new nullable column, new table, new index (CONCURRENTLY) | Single deploy; old code ignores it |
| Compatible transformation | backfill then NOT NULL | Expand → dual-write/backfill → constraint |
| Destructive | drop column/table, rename, type change | Expand → migrate app → verify → contract (each step its own deploy) |

## Implementation procedure

1. Classify the change as additive, compatible transformation, or destructive.
2. Use expand-contract for incompatible replacements.
3. Deploy schema expansion.
4. Deploy application code that can read/write both representations if needed.
5. Backfill incrementally and observe progress.
6. Switch reads/writes, verify usage, then contract old schema.

**Reference example** — renaming `user_name` to `display_name` without a mixed-version outage (each numbered step is a separately deployed migration):

```sql
-- Migration 1: EXPAND — add the new column, keep both live
ALTER TABLE users ADD COLUMN display_name text;
-- Old app still reads user_name; new app dual-writes both columns.

-- Migration 2: BACKFILL — batched, resumable, lock-bounded
-- (application-level backfill job, NOT one giant UPDATE)
UPDATE users SET display_name = user_name
WHERE id IN (SELECT id FROM users WHERE display_name IS NULL LIMIT 10_000);
-- Loop with progress checkpoint + statement_timeout; observe replication lag
-- between batches. Run until zero rows remain.

-- Migration 3: CONSTRAIN — enforce after data is complete
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;
-- New app reads display_name only; old versions are gone by now.

-- Migration 4: CONTRACT — remove the old column (last, after usage audit)
ALTER TABLE users DROP COLUMN user_name;
-- Audit first: zero references in code, queries, dashboards, reports.
```

```ts
// The backfill job: bounded batches, resumable, observable
export async function backfillDisplayName(db: Db): Promise<void> {
  let migrated = 0;
  while (true) {
    const rows = await db.tx(async (tx) =>
      tx.query(`SELECT id, user_name FROM users
                WHERE display_name IS NULL LIMIT ${BATCH_SIZE} FOR UPDATE SKIP LOCKED`));
    if (rows.length === 0) break;
    await db.tx(async (tx) => {
      for (const row of rows) {
        await tx.exec(`UPDATE users SET display_name = $1 WHERE id = $2`,
          [sanitize(row.user_name), row.id]);
      }
    });
    migrated += rows.length;
    await checkpoint.record("display_name", migrated);   // resumable after crash
    await waitForReplicationLag(db, MAX_LAG_MS);         // batches respect replicas
  }
}
```

Online index creation (PostgreSQL — regular CREATE INDEX locks writes):

```sql
-- WRONG under traffic: exclusive lock for the build duration
CREATE INDEX idx_orders_status ON orders (status);

-- RIGHT: concurrent build, no write lock (cannot run inside a transaction)
CREATE INDEX CONCURRENTLY idx_orders_status ON orders (status);
-- Failure leaves an INVALID index: check pg_index.indisvalid before relying on it.
```

## Failure modes

- Rename breaks old binaries during mixed-version deploys — a single `ALTER TABLE ... RENAME` deployed with the new app while old app instances still reference the old name.
- Large migration blocks production traffic: `ALTER TABLE ADD COLUMN ... DEFAULT` on PostgreSQL 10 rewrote the whole table (11+ stores it as metadata — know your version's behavior).
- Backfill runs in one huge transaction — lock escalation, replication lag, vacuum blocking; batch instead.
- Rollback assumes dropped data can be restored — `DROP COLUMN` deletes data; "rollback" of migration 4 does not resurrect `user_name`.
- Multiple deploys race to apply incompatible migrations — two CI pipelines merging conflicting migration numbers; enforce sequential application and a single migration lock table.
- `CREATE INDEX` (non-concurrent) on a hot table timing out or queuing all writes behind it.
- Failed `CREATE INDEX CONCURRENTLY` leaving an invalid index that silently never serves queries.

## Verification

Test migration ordering against old/new app versions, lock impact, resume/retry behavior, partial backfill, and cleanup. Concretely: (a) run old app + migration 1 → old app still functions (reads user_name, writes both); (b) kill the backfill mid-run → restart resumes from checkpoint with zero double-work; (c) mixed-version test — new app reads display_name while migration 2 is partially complete; (d) pg_dump/index audit confirms the concurrent index is valid; (e) deploy the contract migration with an old-version instance still running → it fails the readiness gate (by design, before production).

## Sources

- https://www.postgresql.org/docs/current/ddl-alter.html
- Concurrent index builds and INVALID index cleanup: https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY
- Expand/contract pattern (general practice): https://dataschool.com/what-is-expand-and-contract/
