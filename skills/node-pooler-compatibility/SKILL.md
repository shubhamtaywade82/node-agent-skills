---
name: node-pooler-compatibility
description: Use when PgBouncer-like or cloud poolers sit between Node and the database.
---

# Database Pooler Compatibility

## Purpose

using connection poolers without violating transaction/session semantics.

## Activate when

- PgBouncer-like or cloud poolers sit between Node and the database.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

session state, prepared statements, temp tables, advisory locks, and transaction semantics are matched to pool mode

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Identify pooler mode.\n2. Inventory session state.\n3. Test prepares/locks/temp objects.\n4. Configure transaction/session affinity.\n5. Document unsupported features.

## Failure modes

Avoid:

- assuming session state persists in transaction pooling; mixing prepared statements with incompatible pool modes.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
