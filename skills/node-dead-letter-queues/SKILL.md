---
name: node-dead-letter-queues
description: Use when failed messages require later inspection or replay.
---

# Dead Letter Queues

## Purpose

designing DLQs as controlled recovery mechanisms rather than message graveyards.

## Activate when

- failed messages require later inspection or replay.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

DLQ retention, ownership, reason metadata, redrive policy, and authorization are explicit

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Define dead-letter trigger.
2. Preserve metadata.
3. Set retention.
4. Alert on growth.
5. Build safe redrive.
6. Validate target version/schema before replay.

## Failure modes

Avoid:

- no retention policy; automatic blind redrive; losing original failure reason.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
