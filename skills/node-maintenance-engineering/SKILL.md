---
name: node-maintenance-engineering
description: Use when a service needs upgrades, housekeeping, or scheduled maintenance.
---

# Maintenance Engineering

## Purpose

planning dependency, runtime, framework, and repository maintenance without destabilizing production.

## Activate when

- a service needs upgrades, housekeeping, or scheduled maintenance.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

maintenance is scoped, reversible, and tested against compatibility matrices; stale components are removed deliberately

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Inventory aging dependencies.\n2. Classify support status.\n3. Schedule upgrades.\n4. Test representative workloads.\n5. Update docs/config.\n6. Define rollback.\n7. Verify CI and runtime health.

## Failure modes

Avoid:

- bulk upgrades without sequencing; dropping support accidentally; ignoring transitive security fixes.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
