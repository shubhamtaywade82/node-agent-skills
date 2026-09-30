---
name: node-data-quality
description: Use when data quality affects business logic, reporting, imports, or derived state.
---

# Data Quality

## Purpose

detecting invalid, incomplete, inconsistent, or anomalous backend data.

## Activate when

- data quality affects business logic, reporting, imports, or derived state.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

quality rules are explicit and observable; invalid data is quarantined or rejected according to contract; remediation is auditable

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Define invariants.
2. Validate at boundaries.
3. Profile existing data.
4. Classify defects.
5. Quarantine/repair.
6. Monitor drift.
7. Add regression cases.

## Failure modes

Avoid:

- silent coercion; fixing data without audit; validating only on read.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
