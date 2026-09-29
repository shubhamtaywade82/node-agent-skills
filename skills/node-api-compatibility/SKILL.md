---
name: node-api-compatibility
description: Use when an API change may affect existing consumers.
---

# API Compatibility

## Purpose

preserving client-visible compatibility while evolving backend APIs.

## Activate when

- an API change may affect existing consumers.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

compatibility is evaluated against documented and observed contracts; additive changes are not automatically safe; deprecation and migration paths are explicit

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Identify consumers.
2. Classify breaking surface.
3. Compare request/response/schema/error/auth semantics.
4. Choose compatible evolution or migration.
5. Add contract tests.
6. Document transition.

## Failure modes

Avoid:

- changing error shapes casually; removing fields/parameters without evidence; assuming internal clients have no compatibility needs.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
