---
name: node-data-retention
description: Use when legal, privacy, storage, or product policy requires data expiry.
---

# Data Retention

## Purpose

implementing retention and deletion policies for backend data.

## Activate when

- legal, privacy, storage, or product policy requires data expiry.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

retention is policy-driven; deletion scope and evidence are explicit; backups and derived stores are considered

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Classify data.
2. Define retention clock.
3. Schedule deletion.
4. Cover primary/derived/search/cache/archive stores.
5. Verify backup implications.
6. Audit execution.

## Failure modes

Avoid:

- retaining data indefinitely by accident; deleting only primary rows; retention based on mutable client timestamps.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
