---
name: node-isolation-level-selection
description: Use when concurrency anomalies depend on transaction isolation.
---

# Transaction Isolation Selection

## Purpose

choosing database transaction isolation levels from correctness requirements.

## Activate when

- concurrency anomalies depend on transaction isolation.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

isolation is selected for an explicit invariant and workload, not as a blanket default; stronger isolation costs are measured

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. State required invariants.\n2. Map anomaly risks.\n3. Choose level.\n4. Test concurrent schedules.\n5. Measure contention.\n6. Document rationale.

## Failure modes

Avoid:

- using serializable everywhere without workload analysis; lowering isolation to fix contention without tests.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
