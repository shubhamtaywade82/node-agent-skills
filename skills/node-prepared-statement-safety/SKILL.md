---
name: node-prepared-statement-safety
description: Use when a database driver prepares or caches SQL statements.
---

# Prepared Statement Safety

## Purpose

using prepared statements without plan, naming, or compatibility hazards.

## Activate when

- a database driver prepares or caches SQL statements.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

parameters remain bound values; statement names are collision-safe; prepared state is compatible with pool/proxy topology

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Identify driver prepare behavior.\n2. Avoid interpolated SQL.\n3. Scope names.\n4. Test repeated execution.\n5. Verify transaction/pooler compatibility.\n6. Measure prepare overhead.

## Failure modes

Avoid:

- concatenating user input; static names colliding across connections; assuming server-side prepares work identically through every pooler.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
