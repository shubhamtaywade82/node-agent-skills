---
name: node-data-lineage
description: Use when analytics, compliance, debugging, reconciliation, or derived models require provenance.
---

# Data Lineage

## Purpose

tracking where important backend data originated and how it was transformed.

## Activate when

- analytics, compliance, debugging, reconciliation, or derived models require provenance.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

lineage identifies source, transformation, version, and timestamp without leaking sensitive payloads

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Define lineage metadata.
2. Attach source/version identifiers.
3. Preserve through transformations.
4. Expose audit queries.
5. Bound storage.

## Failure modes

Avoid:

- copying full sensitive payloads into lineage; lineage without stable identifiers.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
