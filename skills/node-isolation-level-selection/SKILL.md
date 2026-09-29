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

- Select the weakest PostgreSQL isolation level that prevents the application's documented anomalies.
- Isolation choices must be tied to workload invariants, not generic claims that stronger is always better.
- Serializable or repeatable-read failures need bounded retry semantics where the operation is safe to replay.
- Isolation cannot replace explicit authorization or application invariants.

## Implementation procedure

1. State the anomaly or invariant that must be prevented.
2. Map it to transaction isolation behavior.
3. Choose and document the minimum sufficient level.
4. Test concurrent schedules that exercise the invariant.
5. Verify retry and error handling for serialization failures.

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
