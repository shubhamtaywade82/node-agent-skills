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

- Writes remain on the authoritative primary unless the storage contract explicitly supports otherwise.
- Read-after-write paths must pin to the primary or use an explicit consistency mechanism.
- Replica selection must account for lag and health rather than random choice alone.
- Routing decisions must be observable so stale reads can be correlated with topology.

## Implementation procedure

1. Classify each read by consistency requirement.
2. Detect primary and replica topology.
3. Route only consistency-safe reads to replicas.
4. Handle lag, replica failure, and post-write pinning.
5. Test stale-read and failover scenarios.

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
