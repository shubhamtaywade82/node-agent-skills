---
name: node-backward-compatibility-testing
description: Use when a backend or package has external or multi-version consumers.
---

# Backward Compatibility Testing

## Purpose

proving that API/library/runtime changes preserve supported consumers.

## Activate when

- a backend or package has external or multi-version consumers.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

compatibility is tested against documented contracts and representative previous versions

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Define compatibility matrix.
2. Run contract tests.
3. Test serialization/error semantics.
4. Exercise mixed-version deployment.
5. Document intentional breaks.

## Failure modes

Avoid:

- testing only latest consumer; relying on TypeScript compile success; ignoring wire compatibility.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
