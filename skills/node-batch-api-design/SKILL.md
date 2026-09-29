---
name: node-batch-api-design
description: Use when clients need to submit or retrieve many resources in one request.
---

# Batch API Design

## Purpose

designing HTTP APIs that accept or return multiple operations with bounded semantics.

## Activate when

- clients need to submit or retrieve many resources in one request.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

batch size, partial success, idempotency, authorization, and response correlation are explicit

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Define maximum batch size.
2. Validate each item.
3. Correlate results.
4. Choose atomic vs partial semantics.
5. Enforce per-item authorization.
6. Bound processing.
7. Document retries.

## Failure modes

Avoid:

- one giant transaction by default; unclear partial failures; authorization only at batch level.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
