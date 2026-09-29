---
name: node-database-migrations-production
description: Use when planning or executing production database changes that must remain compatible with live traffic, mixed application versions, replicas, or long-running backfills.
---

# Production Database Migrations

## Purpose
Production DDL is a live systems change. Design schema evolution around locks, compatibility, workload size, and recovery.

## Activate when
- A migration touches a large/high-traffic table.
- A deploy requires old and new binaries to coexist.
- Backfills or destructive cleanup are involved.

## Repository inspection
Inspect table size, write rate, indexes, lock behavior, database version, deploy topology, migration tool, and observability for lock waits/query latency.

## Decision rules
| Concern | Rule |
|---|---|
| Compatibility | Use expand-contract when schema and application versions overlap. |
| Locks | Estimate lock duration and conflict impact before execution. |
| Backfill | Batch work, checkpoint progress, and throttle based on production load. |
| Indexes | Prefer non-blocking/concurrent database mechanisms when supported and needed. |
| Destruction | Remove old columns/data only after telemetry proves they are unused. |
| Recovery | Define pause, resume, rollback/roll-forward, and repair procedures before production execution. |

## Implementation procedure
1. Model old/new schema compatibility.
2. Separate expansion, data movement, cutover, and contraction.
3. Add observability for lock waits and migration progress.
4. Run small production-scale rehearsals.
5. Execute with bounded batches and explicit operator controls.
6. Verify application and data invariants before contraction.

## Failure modes
- DDL waits behind a long transaction and blocks user traffic.
- Backfill consumes all DB capacity.
- Old replicas cannot start after schema expansion.
- Migration fails halfway and has no resume point.
- Cleanup removes data required by an unobserved consumer.

## Verification
Test mixed versions, lock contention, pause/resume, partial failure, backfill correctness, and post-cutover reads/writes.
