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

lock namespace and scope are explicit; session/transaction lifetime is safe; lock acquisition has a bounded policy

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Identify shared resource.\n2. Choose lock key namespace.\n3. Choose transaction/session scope.\n4. Bound wait.\n5. Release deterministically.\n6. Test competing workers and crashes.

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
