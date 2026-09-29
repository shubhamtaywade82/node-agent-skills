---
name: node-maintenance-engineering
description: Use when scheduled upgrades, patching, or maintenance windows are required.
---

# Maintenance Engineering

## Purpose

planning dependency, runtime, and infrastructure maintenance without destabilizing production.

## Activate when

- scheduled upgrades, patching, or maintenance windows are required.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

maintenance is incremental, observable, reversible, and compatible with mixed-version deployment

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Inventory versions.
2. Classify risk.
3. Test upgrade path.
4. Schedule rollout.
5. Define rollback.
6. Monitor post-change behavior.

## Failure modes

Avoid:

- bundling unrelated upgrades; upgrading without compatibility tests; no rollback window.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
