---
name: node-database-read-replica-routing
description: Use when a backend uses read replicas for scale.
---

# Database Read Replica Routing

## Purpose

routing database reads and writes across primary/replica topology without stale-read correctness bugs.

## Activate when

- a backend uses read replicas for scale.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

writes go to authoritative primary; read-after-write requirements override replica preference; routing is explicit and observable

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Classify query consistency.\n2. Detect primary/replica clients.\n3. Route reads.\n4. Pin sessions after writes when needed.\n5. Handle replica lag/failure.\n6. Test stale-read windows.

## Failure modes

Avoid:

- sending mutations to replicas; hiding lag; random replica routing for consistency-sensitive reads.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
