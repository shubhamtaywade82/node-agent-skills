---
name: node-deprecation-management
description: Use when public APIs, configuration keys, or dependencies need phased removal.
---

# Deprecation Management

## Purpose

introducing and consuming API/package deprecations safely.

## Activate when

- public APIs, configuration keys, or dependencies need phased removal.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

deprecation is observable and time-bounded; compatibility remains until migration evidence exists

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Identify consumers.
2. Emit appropriate deprecation signal.
3. Document replacement.
4. Measure usage.
5. Remove only after migration criteria.

## Failure modes

Avoid:

- deprecating without replacement; removing immediately; logging noisy deprecations on every request.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
