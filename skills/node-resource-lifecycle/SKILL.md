---
name: node-resource-lifecycle
description: Use when resources have states, ownership, retention, or asynchronous deletion.
---

# Resource Lifecycle

## Purpose

making create/update/archive/delete transitions explicit for backend resources.

## Activate when

- resources have states, ownership, retention, or asynchronous deletion.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

state transitions have invariants and authorization; terminal states are explicit; side effects are tied to transitions

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Model lifecycle states.
2. Define legal transitions.
3. Enforce ownership.
4. Make deletion idempotent.
5. Handle asynchronous cleanup.
6. Expose state to clients.

## Failure modes

Avoid:

- boolean deleted flags hiding lifecycle complexity; side effects outside transitions; resurrecting terminal resources accidentally.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
