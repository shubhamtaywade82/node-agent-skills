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

deprecation is observable, time-bounded, and compatible during migration; usage is measured before removal

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Identify consumers.\n2. Add deprecation signal.\n3. Publish replacement.\n4. Measure usage.\n5. Set removal criteria/date.\n6. Test mixed versions.\n7. Remove after evidence.

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
