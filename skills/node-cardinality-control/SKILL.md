---
name: node-cardinality-control
description: Use when metrics contain user IDs, URLs, error messages, or other unbounded dimensions.
---

# Telemetry Cardinality Control

## Purpose

preventing metric/label cardinality explosions in Node.js observability.

## Activate when

- metrics contain user IDs, URLs, error messages, or other unbounded dimensions.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

metric labels are finite controlled sets; dynamic values belong in logs/traces rather than metric labels

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Inventory label dimensions.
2. Define allowlists.
3. Normalize route templates.
4. Cap dynamic dimensions.
5. Monitor series growth.
6. Test representative traffic.

## Failure modes

Avoid:

- using raw URL/user ID as metric labels; relying on backend limits after explosion.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
