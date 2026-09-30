---
name: node-bulk-operations
description: Use when administrative or user workflows update many records.
---

# Bulk Operations

## Purpose

executing large backend mutations safely and resumably.

## Activate when

- administrative or user workflows update many records.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

bulk work is bounded, observable, resumable, and safe against duplicates; destructive operations require explicit confirmation/authorization

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Define selection snapshot.
2. Chunk work.
3. Checkpoint.
4. Rate-limit.
5. Report failures.
6. Make retries idempotent.
7. Audit destructive actions.

## Failure modes

Avoid:

- unbounded DELETE/UPDATE; loading all rows; retrying destructive operations without idempotency.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
