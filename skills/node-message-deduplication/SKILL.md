---
name: node-message-deduplication
description: Use when delivery is at-least-once or retries can duplicate work.
---

# Message Deduplication

## Purpose

handling duplicate message delivery without repeating unsafe side effects.

## Activate when

- delivery is at-least-once or retries can duplicate work.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

deduplication key is stable and stored at the authoritative side-effect boundary; TTL is chosen from replay risk

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Define event/message identity.
2. Persist processed identity transactionally with side effect when possible.
3. Bound storage.
4. Handle concurrent duplicates.
5. Test replay.

## Failure modes

Avoid:

- in-memory dedupe; dedupe after side effect; short TTL that permits unsafe replay.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
