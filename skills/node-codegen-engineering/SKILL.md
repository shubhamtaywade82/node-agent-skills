---
name: node-codegen-engineering
description: Use when OpenAPI, GraphQL, protobuf, database schemas, or templates generate source code.
---

# Code Generation Engineering

## Purpose

designing reproducible TypeScript code generation from schemas or specifications.

## Activate when

- OpenAPI, GraphQL, protobuf, database schemas, or templates generate source code.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

source definitions are authoritative; generator/version/config are pinned; output is deterministic

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Define source.
2. Pin generator.
3. Isolate generated output.
4. Make generation explicit.
5. Verify clean regeneration.
6. Review generated diff.
7. Cache safely.

## Failure modes

Avoid:

- generation depending on machine state; hidden network calls; nondeterministic timestamps.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
