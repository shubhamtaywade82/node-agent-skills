---
name: node-encryption-at-rest
description: Use when backend state requires encryption beyond provider defaults or field-level protection.
---

# Encryption at Rest

## Purpose

protecting persisted sensitive data using appropriate storage encryption.

## Activate when

- backend state requires encryption beyond provider defaults or field-level protection.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

threat model determines whether provider/storage or application-level encryption is needed; key separation and rotation are explicit

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Classify data.
2. Choose storage/field encryption.
3. Define nonce/IV handling.
4. Separate keys.
5. Plan rotation.
6. Test decryptability and access controls.

## Failure modes

Avoid:

- inventing cryptography; static keys in code; reusing nonces; encrypting without recovery/key rotation plan.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
