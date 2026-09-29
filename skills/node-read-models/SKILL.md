---
name: node-read-models
description: Use when a service maintains denormalized or materialized views for fast reads.
---

# Read Model Engineering

## Purpose

building derived query models with explicit freshness, rebuild, and authorization semantics.

## Activate when

- a service maintains denormalized or materialized views for fast reads.
- The system has a state, contract, or performance boundary that benefits from explicit ownership.

## Repository inspection

1. Detect runtime, package manager, persistence layer, messaging, and test framework.
2. Locate the authoritative data owner and current transaction boundaries.
3. Trace consumers, derived state, background jobs, and operational tooling.
4. Inspect migrations, existing tests, and deployment assumptions.

## Decision rules

read models are derived state; source of truth remains explicit; rebuilds are repeatable; version/cursor semantics are deliberate

- Keep the design proportional to actual complexity; do not introduce distributed patterns by default.
- Runtime validation and authorization remain explicit at trust boundaries.
- Durability, consistency, retry, and replay semantics must be documented.
- Prefer deterministic, idempotent operations for recovery paths.

## Implementation procedure

1. Define source events/tables.
2. Choose projection trigger.
3. Assign model version.
4. Make projections idempotent.
5. Design rebuild and backfill.
6. Expose freshness metrics.
7. Enforce tenant/resource filtering.

## Failure modes

Avoid:

- manual edits to projections; no rebuild path; cross-tenant derived data; treating stale results as current without contract.
- Unbounded memory, concurrency, retries, or scans.
- Silent consistency changes that are not reflected in the API or operator contract.

## Verification

1. Add focused tests before changing observable behavior.
2. Exercise concurrency, replay, partial failure, and recovery cases relevant to the pattern.
3. Verify data invariants at the authoritative boundary.
4. Run focused tests and the full suite.
5. Run typecheck/build/lint and migration/deployment gates when applicable.
