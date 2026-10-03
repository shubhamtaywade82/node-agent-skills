---
name: node-repository-health
description: Use when an agent prepares a large change, an upgrade, or a handoff in an unfamiliar backend repository.
---

# Repository Health

## Purpose

evaluating a Node.js backend repository for maintainability, reproducibility, and operational hygiene.

## Activate when

- an agent prepares a large change, an upgrade, or a handoff in an unfamiliar backend repository.
- The change crosses a security, runtime, or repository-quality boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, tests, build, CI, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and existing verification.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

health is evidence-based: dependency state, tests, CI, docs, ownership, generated files, and stale configuration are inspected before change

- Prefer explicit policies and deterministic evidence over defaults.
- Preserve existing contracts unless the task explicitly changes them.
- Keep failure handling bounded, observable, and reversible.

## Implementation procedure

1. Run repository preflight.\n2. Inspect package and lockfile consistency.\n3. Verify test/build/CI commands.\n4. Detect stale artifacts.\n5. Inspect ownership/docs.\n6. Record findings and blockers.

## Failure modes

Avoid:

- treating green CI as complete repository health; ignoring stale docs or lockfiles; changing infrastructure to hide repository drift.
- Unbounded retries, output, logging, or resource usage.
- Making security decisions from untrusted metadata alone.

## Verification

1. Add a failing regression or contract test first.
2. Exercise boundary, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Review the diff and residual risk.
5. Report exactly what was verified.
