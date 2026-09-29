---
name: node-runtime-upgrade-planning
description: Use when the service moves between supported Node.js versions.
---

# Runtime Upgrade Planning

## Purpose

planning Node.js major/minor runtime upgrades safely.

## Activate when

- the service moves between supported Node.js versions.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

upgrade considers runtime semantics, native modules, dependencies, diagnostics, and deployment images

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Inventory runtime assumptions.
2. Read release changes.
3. Test dependency compatibility.
4. Run representative workload.
5. Stage rollout.
6. Monitor and retain rollback.

## Failure modes

Avoid:

- changing runtime and dependencies simultaneously without isolation; testing only unit suite.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
