---
name: node-data-reconciliation
description: Use when two durable representations can drift because of retries, outages, migrations, or eventual consistency.
---

# Data Reconciliation

## Purpose

detecting and repairing divergence between systems, projections, caches, or derived records.

## Activate when

- two durable representations can drift because of retries, outages, migrations, or eventual consistency.
- The system has a state, contract, or performance boundary that benefits from explicit ownership.

## Repository inspection

1. Detect runtime, package manager, persistence layer, messaging, and test framework.
2. Locate the authoritative data owner and current transaction boundaries.
3. Trace consumers, derived state, background jobs, and operational tooling.
4. Inspect migrations, existing tests, and deployment assumptions.

## Decision rules

reconciliation is evidence-driven and idempotent; repairs do not silently invent truth; discrepancies are observable and bounded

- Keep the design proportional to actual complexity; do not introduce distributed patterns by default.
- Runtime validation and authorization remain explicit at trust boundaries.
- Durability, consistency, retry, and replay semantics must be documented.
- Prefer deterministic, idempotent operations for recovery paths.

## Implementation procedure

1. Define authoritative source.
2. Choose reconciliation key.
3. Sample or scan within bounded budgets.
4. Classify discrepancy.
5. Repair safely.
6. Record audit/evidence.
7. Repeat without duplication.

## Failure modes

Avoid:

- repairing from the wrong source; unbounded full scans in production; deleting unmatched data without policy; no audit trail.
- Unbounded memory, concurrency, retries, or scans.
- Silent consistency changes that are not reflected in the API or operator contract.

## Verification

1. Add focused tests before changing observable behavior.
2. Exercise concurrency, replay, partial failure, and recovery cases relevant to the pattern.
3. Verify data invariants at the authoritative boundary.
4. Run focused tests and the full suite.
5. Run typecheck/build/lint and migration/deployment gates when applicable.
