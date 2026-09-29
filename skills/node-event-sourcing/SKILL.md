---
name: node-event-sourcing
description: Use when current state must be reconstructed from durable domain events rather than only storing mutable rows.
---

# Event Sourcing

## Purpose

using an append-only domain event history as the authoritative state representation when replay/audit/time-travel requirements justify it.

## Activate when

- current state must be reconstructed from durable domain events rather than only storing mutable rows.
- The system has a state, contract, or performance boundary that benefits from explicit ownership.

## Repository inspection

1. Detect runtime, package manager, persistence layer, messaging, and test framework.
2. Locate the authoritative data owner and current transaction boundaries.
3. Trace consumers, derived state, background jobs, and operational tooling.
4. Inspect migrations, existing tests, and deployment assumptions.

## Decision rules

events are immutable facts; aggregate invariants are enforced at append time; stream identity/version is explicit; snapshots are optimizations; schema evolution is mandatory

- Keep the design proportional to actual complexity; do not introduce distributed patterns by default.
- Runtime validation and authorization remain explicit at trust boundaries.
- Durability, consistency, retry, and replay semantics must be documented.
- Prefer deterministic, idempotent operations for recovery paths.

## Implementation procedure

1. Define aggregate stream identity.
2. Command against expected version.
3. Append immutable events atomically.
4. Design replay/snapshot strategy.
5. Version event schemas.
6. Test concurrent append and historical rebuild.

## Failure modes

Avoid:

- using event sourcing for ordinary CRUD; mutating past events; assuming event order across aggregates; no migration strategy for old event versions.
- Unbounded memory, concurrency, retries, or scans.
- Silent consistency changes that are not reflected in the API or operator contract.

## Verification

1. Add focused tests before changing observable behavior.
2. Exercise concurrency, replay, partial failure, and recovery cases relevant to the pattern.
3. Verify data invariants at the authoritative boundary.
4. Run focused tests and the full suite.
5. Run typecheck/build/lint and migration/deployment gates when applicable.
