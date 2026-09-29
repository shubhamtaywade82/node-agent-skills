---
name: node-cqrs
description: Use when the same aggregate cannot efficiently serve both mutation invariants and query-specific projections.
---

# CQRS

## Purpose

separating write-side command handling from read-side query models when their scaling, consistency, or domain complexity genuinely differ.

## Activate when

- the same aggregate cannot efficiently serve both mutation invariants and query-specific projections.
- The system has a state, contract, or performance boundary that benefits from explicit ownership.

## Repository inspection

1. Detect runtime, package manager, persistence layer, messaging, and test framework.
2. Locate the authoritative data owner and current transaction boundaries.
3. Trace consumers, derived state, background jobs, and operational tooling.
4. Inspect migrations, existing tests, and deployment assumptions.

## Decision rules

CQRS is a trade-off, not a default; write and read paths need explicit consistency semantics; commands enforce invariants; queries never bypass authorization

- Keep the design proportional to actual complexity; do not introduce distributed patterns by default.
- Runtime validation and authorization remain explicit at trust boundaries.
- Durability, consistency, retry, and replay semantics must be documented.
- Prefer deterministic, idempotent operations for recovery paths.

## Implementation procedure

1. Identify whether read/write pressure or model divergence justifies separation.
2. Define command ownership.
3. Define read model ownership.
4. Choose synchronous or asynchronous projection.
5. Document staleness.
6. Test command invariants and projection recovery.

## Failure modes

Avoid:

- splitting every CRUD model; assuming immediate read-after-write with asynchronous projections; duplicating authorization logic inconsistently.
- Unbounded memory, concurrency, retries, or scans.
- Silent consistency changes that are not reflected in the API or operator contract.

## Verification

1. Add focused tests before changing observable behavior.
2. Exercise concurrency, replay, partial failure, and recovery cases relevant to the pattern.
3. Verify data invariants at the authoritative boundary.
4. Run focused tests and the full suite.
5. Run typecheck/build/lint and migration/deployment gates when applicable.
