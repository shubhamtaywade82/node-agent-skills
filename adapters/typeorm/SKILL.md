---
name: adapter-typeorm
description: Use when the repository uses TypeORM.
---

# TypeORM adapter

## Purpose

Translate framework-neutral Node.js persistence/workflow guidance into TypeORM-specific mechanics.

## Activate when

- TypeORM is present in the target repository.
- The detected installed version matches the scope below.

## Repository inspection

1. Inspect package.json, lockfile, data-source/connection configuration, and imports.
2. Confirm the exact installed version.
3. Locate client/connection construction, transaction boundaries, and shutdown ownership.
4. Inspect migrations, indexes, query tests, and existing integration tests.

## Decision rules

- Keep the framework-neutral persistence and transaction skills authoritative.
- Reuse long-lived connection/client resources.
- Never treat compile-time model types as runtime validation.
- Avoid hidden network/database work inside domain code.

## Implementation procedure

1. Detect TypeORM and exact version.
2. Map the change to the owning core persistence skill.
3. Apply TypeORM-specific lifecycle/query/transaction mechanics.
4. Add focused integration tests for failure and cleanup.
5. Verify migration and production connection behavior.

## Failure modes

- Copying APIs from an incompatible major version.
- Creating connections per request.
- Long-lived or leaked transactions/connections.
- Production schema mutation through development-only synchronization.

## Verification

1. Run focused integration tests.
2. Run full suite and build/typecheck gates.
3. Verify connection cleanup and transaction rollback.
4. Review query/index behavior for load and correctness.

## Source

https://typeorm.io/docs/data-source/data-source/

## Version scope

0.3.x/current.

## Adapter guidance

Own DataSource lifecycle; disable synchronize in production; use migrations; keep transaction manager/entity manager scoped to the transaction; avoid lazy-loading surprises and N+1 queries; verify generated migrations before applying them.
