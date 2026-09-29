---
name: node-database-read-replicas
description: Use when a database deployment uses primary/replica topology or read scaling.
---

# Database Read Replicas

## Purpose

routing reads to replicas while preserving correctness under replication lag.

## Activate when

- a database deployment uses primary/replica topology or read scaling.
- The system has a state, contract, or performance boundary that benefits from explicit ownership.

## Repository inspection

1. Detect runtime, package manager, persistence layer, messaging, and test framework.
2. Locate the authoritative data owner and current transaction boundaries.
3. Trace consumers, derived state, background jobs, and operational tooling.
4. Inspect migrations, existing tests, and deployment assumptions.

## Decision rules

write authority remains clear; read-after-write semantics are explicit; transactions stay on the correct connection; lag is observable

- Keep the design proportional to actual complexity; do not introduce distributed patterns by default.
- Runtime validation and authorization remain explicit at trust boundaries.
- Durability, consistency, retry, and replay semantics must be documented.
- Prefer deterministic, idempotent operations for recovery paths.

## Implementation procedure

1. Classify consistency-sensitive reads.
2. Route them to primary when needed.
3. Detect lag.
4. Avoid replica reads inside write transactions.
5. Test stale-read scenarios.

## Failure modes

Avoid:

- sending authentication/authorization reads to stale replicas; hidden lag; assuming ORM routing preserves transactions automatically.
- Unbounded memory, concurrency, retries, or scans.
- Silent consistency changes that are not reflected in the API or operator contract.

## Verification

1. Add focused tests before changing observable behavior.
2. Exercise concurrency, replay, partial failure, and recovery cases relevant to the pattern.
3. Verify data invariants at the authoritative boundary.
4. Run focused tests and the full suite.
5. Run typecheck/build/lint and migration/deployment gates when applicable.
