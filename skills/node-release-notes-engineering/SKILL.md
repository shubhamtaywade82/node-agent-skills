---
name: node-release-notes-engineering
description: Use when a library/service release needs user-facing change documentation.
---

# Release Notes Engineering

## Purpose

producing accurate release notes from verified repository changes.

## Activate when

- a library/service release needs user-facing change documentation.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

notes describe observable behavior, compatibility, migrations, and known limitations; no invented claims

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Collect merged changes.
2. Classify breaking/fix/feature/security.
3. Verify versions and migration notes.
4. Include upgrade action where needed.

## Failure modes

Avoid:

- copying commit messages blindly; calling internal refactors user-visible changes.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
