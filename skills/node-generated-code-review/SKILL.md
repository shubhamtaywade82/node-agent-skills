---
name: node-generated-code-review
description: Use when a PR changes generated files or generator configuration.
---

# Generated Code Review

## Purpose

reviewing generated TypeScript/API code for correctness and unsafe drift.

## Activate when

- a PR changes generated files or generator configuration.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

review source and generated diff together; generated output is not accepted merely because it is large

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Identify source change.
2. Regenerate.
3. Inspect semantic diff.
4. Check compatibility/security.
5. Ensure generated artifacts are reproducible.

## Failure modes

Avoid:

- reviewing only generated output; manually patching generated files.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
