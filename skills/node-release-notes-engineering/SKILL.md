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

- Release notes are derived from the verified change set and must distinguish breaking, deprecated, and behavior-preserving changes.
- User-visible impact, migration action, and version applicability must be explicit for breaking changes.
- Do not invent release-note claims from commit titles alone when the diff contradicts them.
- Released notes are historical records; corrections must preserve an auditable change trail.

## Implementation procedure

1. Inspect commits, PR descriptions, and final diffs for user-visible changes.
2. Classify breaking, deprecated, fixed, and operational changes.
3. Add migration or upgrade guidance where required.
4. Cross-check notes against the shipped artifact and version.
5. Validate the final release record before publication.

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
