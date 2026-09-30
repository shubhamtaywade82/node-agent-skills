---
name: node-message-ordering
description: Use when brokers can deliver messages concurrently or out of order.
---

# Message Ordering

## Purpose

preserving or explicitly relaxing event/message ordering where consumers depend on sequence.

## Activate when

- brokers can deliver messages concurrently or out of order.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

ordering scope is explicit—partition, key, aggregate, or global; consumers must not assume stronger ordering than broker provides

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Identify ordering key.
2. Partition consistently.
3. Serialize only necessary scope.
4. Carry sequence/version.
5. Detect gaps.
6. Test concurrent delivery.

## Failure modes

Avoid:

- global ordering assumptions; parallel consumers mutating same aggregate without version checks.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
