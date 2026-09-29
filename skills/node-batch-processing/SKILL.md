---
name: node-batch-processing
description: Use when imports, exports, backfills, recalculations, or administrative jobs operate over many records.
---

# Batch Processing

## Purpose

processing large datasets with bounded resources, resumability, and partial-failure handling.

## Activate when

- imports, exports, backfills, recalculations, or administrative jobs operate over many records.
- The system has a state, contract, or performance boundary that benefits from explicit ownership.

## Repository inspection

1. Detect runtime, package manager, persistence layer, messaging, and test framework.
2. Locate the authoritative data owner and current transaction boundaries.
3. Trace consumers, derived state, background jobs, and operational tooling.
4. Inspect migrations, existing tests, and deployment assumptions.

## Decision rules

batch size and concurrency are explicit; jobs checkpoint; retries are item-aware; partial completion is observable; database pressure is bounded

- Keep the design proportional to actual complexity; do not introduce distributed patterns by default.
- Runtime validation and authorization remain explicit at trust boundaries.
- Durability, consistency, retry, and replay semantics must be documented.
- Prefer deterministic, idempotent operations for recovery paths.

## Implementation procedure

1. Define unit of work.
2. Choose cursor/keyset pagination.
3. Bound concurrency.
4. Checkpoint progress.
5. Classify item failures.
6. Resume safely.
7. Measure throughput/error rates.

## Failure modes

Avoid:

- offset pagination over mutable data; loading entire datasets; one giant transaction; restarting from zero after failure.
- Unbounded memory, concurrency, retries, or scans.
- Silent consistency changes that are not reflected in the API or operator contract.

## Verification

1. Add focused tests before changing observable behavior.
2. Exercise concurrency, replay, partial failure, and recovery cases relevant to the pattern.
3. Verify data invariants at the authoritative boundary.
4. Run focused tests and the full suite.
5. Run typecheck/build/lint and migration/deployment gates when applicable.
