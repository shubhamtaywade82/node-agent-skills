---
name: node-database-advisory-locks
description: Use when multiple workers must coordinate work without locking application tables broadly.
---

# Database Advisory Locks

## Purpose

using advisory locks for cooperative serialization of database work.

## Activate when

- multiple workers must coordinate work without locking application tables broadly.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

- Advisory lock keys require an explicit namespace and collision policy.
- Lock lifetime must match the database session or transaction semantics actually used.
- Acquisition waits need a bounded timeout and a defined failure response.
- Never hold an advisory lock across slow remote I/O unless the contention budget explicitly allows it.

## Implementation procedure

1. Identify the resource being serialized.
2. Define a stable advisory-lock namespace and key.
3. Choose session or transaction ownership deliberately.
4. Bound acquisition and release behavior.
5. Test contention, cancellation, crash cleanup, and duplicate workers.

## Failure modes

Avoid:

- global magic lock keys; holding locks across remote calls; treating advisory locks as ownership proof.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
