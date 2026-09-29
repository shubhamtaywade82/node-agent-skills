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

- Maintenance work starts from supported-version and ownership evidence, not arbitrary dependency churn.
- Prefer small, reversible upkeep changes with explicit end-of-life or security rationale.
- A dependency refresh must preserve runtime and API compatibility or declare the required migration.
- Unmaintained tooling is a risk signal that belongs in the maintenance backlog, not hidden behind a version bump.

## Implementation procedure

1. Inventory supported runtime, framework, and critical dependency lifecycles.
2. Identify stale or unmaintained components with direct repository impact.
3. Separate security, compatibility, and housekeeping work.
4. Apply the smallest justified maintenance change.
5. Run regression, package, and release validation.

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
