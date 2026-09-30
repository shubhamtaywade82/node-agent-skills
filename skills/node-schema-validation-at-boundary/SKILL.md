---
name: node-schema-validation-at-boundary
description: Use when runtime data crosses HTTP, queue, file, or integration boundaries.
---

# Schema Validation at Boundary

## Purpose

validating external messages, files, and API payloads at trust boundaries.

## Activate when

- runtime data crosses HTTP, queue, file, or integration boundaries.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

validation occurs before business logic; schemas are versioned where needed; validation errors are safe and actionable

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Identify boundary.
2. Select schema.
3. Validate unknown data.
4. Normalize only explicitly.
5. Reject or quarantine invalid input.
6. Test malformed payloads.

## Failure modes

Avoid:

- trusting TypeScript types at runtime; partial validation; unsafe coercion.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
