---
name: node-database-read-replicas
description: Use when a database deployment uses primary/replica topology or read scaling, or when consistency-sensitive reads must be routed without stale-read bugs.
---

# Database Read Replicas

## Purpose

Route reads to replicas for scale while keeping correctness explicit under replication lag. The primary is the single write authority; a replica is a delayed, read-mostly view. Every read path is classified by what staleness it tolerates, and the connection that carries a transaction or a read-after-write requirement is chosen deliberately — never inherited from ORM defaults.

## Activate when

- A database deployment uses primary/replica topology or read scaling.
- A feature requires read-after-write consistency (user sees their own write).
- Authentication, authorization, billing, or dashboard reads must not observe stale state.
- Write traffic needs relief via read scale-out, or replica lag is suspected of causing user-visible bugs.

## Boundary with related skills

- Use `node-transactions` for transaction semantics on the primary.
- Use `node-connection-pooling` for per-role pool configuration and checkout discipline.
- Use `node-migrations` for schema compatibility across primary and replicas during rollout.
- Use `node-observability` for lag metrics, alerts, and stale-read diagnostics.

## Repository inspection

1. Map the topology: who is primary, which replicas exist, how failover is decided.
2. Find every connection/pool the app opens; identify which are configured for reads vs writes.
3. Inspect the ORM/query builder's routing behavior: automatic read/write splitting, transaction pinning, replica selection.
4. Locate read-after-write flows (write then render own data) and classify each read by staleness tolerance.
5. Check how replication lag is exposed (metrics endpoints, `pg_stat_replication`, cloud monitoring) and whether any alerting exists.

## Decision rules

| Concern | Rule |
|---|---|
| Write authority | All writes go to the primary; replicas are read-only — never write through a replica even via a "hidden" path. |
| Read-after-write | Route the read to the primary, or verify replication position (LSN/sequence/GTID) before reading a replica. |
| Transactions | Never run a transaction that reads-then-writes against a replica; the whole transaction stays on the primary. |
| Staleness classes | Classify every read: primary-required, lag-bounded (verify position), or stale-tolerant; encode the class at the query site. |
| Lag observability | Lag must be measurable and alerted; a replica that silently falls behind must be detectable, not discovered by users. |
| Session pinning | After a write, pin the session (or the user's requests) to primary for a bounded window as a simple, honest default. |
| Failover | Replica promotion changes the answer to "is this fresh?" — re-verify routing assumptions after promotion, not just connectivity. |

## Implementation procedure

1. Classify consistency-sensitive reads (auth, billing, user-visible own-writes) vs stale-tolerant reads.
2. Split pools by role: a write pool (primary) and a read pool (replicas), so role is a property of the connection, not a per-query accident.
3. Route stale-tolerant reads to replicas; keep primary-required reads on the write path.
4. For lag-bounded reads, verify replication position before serving (wait for LSN/GTID, or fall back to primary).
5. Expose lag as a metric and alert when it exceeds the staleness budget.
6. Test stale-read scenarios deliberately, including replicas paused mid-test.

**Reference example** — read-your-writes with position verification (PostgreSQL):

```ts
// After a write on the primary, capture its WAL position.
const { rows } = await primary.query("SELECT pg_current_wal_lsn() AS lsn");
const lsn = rows[0].lsn;

// A lag-bounded read verifies the replica has replayed past that position
// before serving, else it falls back to the primary.
async function readWithFreshness(readDb: Db, sql: string, lsn: string) {
  const { rows: lagRows } = await readDb.query(
    "SELECT pg_last_wal_replay_lsn() AS replayed");
  if (lagRows[0].replayed >= lsn) return readDb.query(sql);
  return primary.query(sql); // replica too stale — serve from source of truth
}
```

For simpler flows, pin the session: after any write, send the same user's next N requests (or N seconds of requests) to the primary, and let the window expire naturally.

## Failure modes

- Sending authentication/authorization reads to a stale replica — the user's password change "doesn't work" or a revoked session stays valid.
- Assuming the ORM's automatic routing preserves transaction semantics — the ORM silently splits a transaction across primary and replica.
- Hidden lag with no metric — staleness is discovered via user reports instead of alerts.
- Read-after-write broken by load-balanced replicas — consecutive requests hit different, differently-lagged replicas.
- Failover/promotion changes freshness characteristics but routing config is unchanged.
- One shared pool where role is inferred per query — a replica occasionally receives a write or a transaction.

## Verification

1. Test stale-read scenarios directly: pause or lag a replica (proxy or fixture), then assert primary-required reads still return fresh data.
2. Assert transactions never execute against the read pool (fixture-level assertion on connection role).
3. Verify the position-verification path: replayed-LSN check falls back to primary when the replica is behind.
4. Exercise failover/promotion: routing assumptions re-verified, no stale auth reads after promotion.
5. Run focused tests and the full suite; run typecheck/build/lint gates.
