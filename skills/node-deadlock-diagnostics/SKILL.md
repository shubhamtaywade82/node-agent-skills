---
name: node-deadlock-diagnostics
description: Use when production or tests show deadlock errors or lock waits.
---

# Deadlock Diagnostics

## Purpose

finding and preventing deadlocks across concurrent database transactions.

## Activate when

- production or tests show deadlock errors or lock waits.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

- Treat a PostgreSQL deadlock as a dependency graph problem: capture the competing locks, transactions, and acquisition order.
- Retrying a deadlock is safe only when the operation is idempotent or transaction semantics prove no duplicate side effect.
- The long-term fix is consistent lock ordering or reduced transaction scope, not unlimited retries.
- Diagnostic logging must identify wait relationships without exposing sensitive SQL parameters.

## Implementation procedure

1. Capture deadlock error, transaction identity, and lock metadata.
2. Reconstruct the wait-for relationship.
3. Identify inconsistent lock ordering or oversized transaction scope.
4. Apply the smallest concurrency fix.
5. Test deterministic reproduction and safe recovery.

## Failure modes

Avoid:

- blind retries; logging sensitive SQL values; treating deadlocks as random noise.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
