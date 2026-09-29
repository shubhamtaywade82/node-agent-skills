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

lock mode and ordering are intentional; transactions remain short; deadlock/retry semantics are bounded

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Identify rows/resources.\n2. Choose lock mode.\n3. Lock in stable order.\n4. Keep transaction short.\n5. Classify retryable errors.\n6. Test contention/deadlock cases.

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
