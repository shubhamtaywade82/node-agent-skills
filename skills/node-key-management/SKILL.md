---
name: node-key-management
description: Use when application encryption/signing keys are introduced or rotated.
---

# Key Management

## Purpose

managing cryptographic keys, rotation, access, and lifecycle.

## Activate when

- application encryption/signing keys are introduced or rotated.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

keys have owners, purpose, version, storage boundary, rotation, and revocation semantics; application code should not become the key vault

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Identify key purpose.
2. Use KMS/secret manager where available.
3. Version key IDs.
4. Support rotation.
5. Restrict access.
6. Test old/new key coexistence.
7. Document emergency revocation.

## Failure modes

Avoid:

- one hard-coded master key; rotation that breaks existing ciphertext; logging key material.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
