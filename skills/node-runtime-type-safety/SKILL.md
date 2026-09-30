---
name: node-runtime-type-safety
description: Use when untyped JSON, environment variables, database documents, or provider responses enter application logic.
---

# Runtime Type Safety

## Purpose

maintaining sound runtime validation where static TypeScript types cannot protect external data.

## Activate when

- untyped JSON, environment variables, database documents, or provider responses enter application logic.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

static types describe code assumptions; runtime validators establish facts; narrowing is explicit and local

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Identify untrusted input.
2. Validate once at boundary.
3. Propagate typed result.
4. Avoid `as` casts as validation.
5. Test invalid shapes.

## Failure modes

Avoid:

- casting unknown data; validating only required fields while using optional nested fields.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
