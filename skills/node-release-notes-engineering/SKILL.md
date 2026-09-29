---
name: node-release-notes-engineering
description: Use when a Node.js backend or skill pack is released with meaningful user-facing changes.
---

# Release Notes Engineering

## Purpose

producing release notes that accurately describe backend behavior, compatibility, migrations, and operational impact.

## Activate when

- a Node.js backend or skill pack is released with meaningful user-facing changes.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

notes are derived from actual commits/diffs and call out breaking changes, migrations, deprecations, and operator actions

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Collect release changes.\n2. Classify user/operator impact.\n3. Summarize compatibility.\n4. Document migrations/rollback.\n5. Verify links and version identifiers.\n6. Keep notes free of unverified claims.

## Failure modes

Avoid:

- copying commit titles blindly; omitting breaking changes; mixing unrelated historical issues into the release.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
