---
name: node-deprecation-planning
description: Use when a Node.js API or internal contract needs to be deprecated.
---

# Deprecation Planning

## Purpose

retiring APIs, events, fields, or dependencies without surprising consumers.

## Activate when

- a Node.js API or internal contract needs to be deprecated.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

- Deprecation requires a documented replacement, migration path, and sunset criteria.
- Existing consumers should have a coexistence period appropriate to the contract and release policy.
- Warning mechanisms must be actionable and avoid leaking sensitive request context.
- Removal is a separate breaking change and requires evidence that the migration path was available.

## Implementation procedure

1. Identify the contract and affected consumers.
2. Define replacement behavior and migration steps.
3. Add deprecation signaling and documentation.
4. Establish a measurable sunset date or release gate.
5. Test old and new paths during coexistence.

## Failure modes

Avoid:

- deprecating without replacement; immediate removal; warning storms; retaining dead compatibility forever.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
