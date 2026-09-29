---
name: node-repository-health
description: Use when an agent or team needs to assess repository structure, tests, docs, dependencies, and CI.
---

# Repository Health

## Purpose

assessing whether a Node.js repository remains maintainable and agent-ready.

## Activate when

- an agent or team needs to assess repository structure, tests, docs, dependencies, and CI.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

health assessment is evidence-based and actionable; avoid subjective scores

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Inspect package metadata.
2. Validate manifests.
3. Run tests/build/lint.
4. Inspect dependency freshness.
5. Verify docs/CI.
6. Report concrete gaps.

## Failure modes

Avoid:

- using arbitrary quality scores; ignoring CI failures; judging style without repository conventions.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
