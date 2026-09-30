---
name: node-consumer-poison-message
description: Use when one malformed or semantically invalid message can repeatedly fail a consumer.
---

# Consumer Poison Message

## Purpose

handling messages that repeatedly fail processing without blocking healthy traffic.

## Activate when

- one malformed or semantically invalid message can repeatedly fail a consumer.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

poison messages are isolated, observable, inspectable, and recoverable; transient and permanent failures are distinguished

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Classify failure.
2. Bound retries.
3. Preserve original payload safely.
4. Route permanent failures to quarantine/DLQ.
5. Alert.
6. Support replay after remediation.

## Failure modes

Avoid:

- infinite retry loops; dropping payloads; treating every error as permanent.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
