---
name: node-data-masking
description: Use when PII, credentials, payment data, or secrets may enter diagnostic or test paths.
---

# Data Masking

## Purpose

redacting sensitive backend data in logs, non-production datasets, and support tooling.

## Activate when

- PII, credentials, payment data, or secrets may enter diagnostic or test paths.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

masking is deterministic only when safe; irreversible secrets are never copied; context-specific access is explicit

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Classify sensitive fields.
2. Mask at serialization/log boundary.
3. Sanitize fixtures/exports.
4. Test common bypasses.
5. Audit support tooling.

## Failure modes

Avoid:

- masking after data has already been logged; reversible encoding mistaken for masking; exposing raw IDs unnecessarily.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
