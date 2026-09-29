---
name: node-postgres-locking
description: Use when transactions need explicit locking for concurrency control.
---

# PostgreSQL Locking

## Purpose

using PostgreSQL row/table locks safely from Node.js.

## Activate when

- transactions need explicit locking for concurrency control.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

- Choose the narrowest PostgreSQL lock mode that preserves the invariant.
- Acquire locks in a consistent order to reduce deadlock risk.
- Keep transactions short and avoid remote calls while holding locks.
- Lock timeouts and failure responses must be explicit.

## Implementation procedure

1. Identify rows/resources that must be protected.
2. Select lock mode and acquisition order.
3. Bound transaction duration and lock waits.
4. Add contention and timeout tests.
5. Verify concurrent readers and writers preserve invariants.

## Failure modes

Avoid:

- SELECT FOR UPDATE across network calls; inconsistent lock order; retrying every error.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
