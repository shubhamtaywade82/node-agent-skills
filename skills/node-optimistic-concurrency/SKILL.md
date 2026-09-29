---
name: node-optimistic-concurrency
description: Use when updates need compare-and-swap, version columns, ETags, or expected revision checks.
---

# Optimistic Concurrency

## Purpose

preventing lost updates when multiple actors may modify the same resource concurrently.

## Activate when

- updates need compare-and-swap, version columns, ETags, or expected revision checks.
- The system has a state, contract, or performance boundary that benefits from explicit ownership.

## Repository inspection

1. Detect runtime, package manager, persistence layer, messaging, and test framework.
2. Locate the authoritative data owner and current transaction boundaries.
3. Trace consumers, derived state, background jobs, and operational tooling.
4. Inspect migrations, existing tests, and deployment assumptions.

## Decision rules

conflict detection belongs at the authoritative write boundary; retrying a conflict requires re-read/recompute; conflict responses are explicit

- Keep the design proportional to actual complexity; do not introduce distributed patterns by default.
- Runtime validation and authorization remain explicit at trust boundaries.
- Durability, consistency, retry, and replay semantics must be documented.
- Prefer deterministic, idempotent operations for recovery paths.

## Implementation procedure

1. Identify mutable resource.
2. Add revision/version invariant.
3. Require expected version.
4. Reject stale writes.
5. Decide safe automatic retries.
6. Expose conflict semantics.
7. Test concurrent writes.

## Failure modes

Avoid:

- last-write-wins by accident; incrementing version outside the protected write; retrying stale updates blindly.
- Unbounded memory, concurrency, retries, or scans.
- Silent consistency changes that are not reflected in the API or operator contract.

## Verification

1. Add focused tests before changing observable behavior.
2. Exercise concurrency, replay, partial failure, and recovery cases relevant to the pattern.
3. Verify data invariants at the authoritative boundary.
4. Run focused tests and the full suite.
5. Run typecheck/build/lint and migration/deployment gates when applicable.
