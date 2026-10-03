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

diagnosis uses database wait graphs/logs; fixes reduce lock overlap/order inconsistency rather than just increasing retries

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Capture deadlock details.\n2. Reconstruct wait graph.\n3. Identify lock order.\n4. Shorten transactions.\n5. Align acquisition order.\n6. Add bounded retry.\n7. Verify concurrency tests.

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
