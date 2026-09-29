---
name: adapter-sequelize
description: Use when the repository uses Sequelize.
---

# Sequelize adapter

## Purpose

Translate framework-neutral Node.js persistence/workflow guidance into Sequelize-specific mechanics.

## Activate when

- Sequelize is present in the target repository.
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

1. Detect Sequelize and exact version.
2. Map the change to the owning core persistence skill.
3. Apply Sequelize-specific lifecycle/query/transaction mechanics.
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

https://sequelize.org/docs/v6/

## Version scope

6.x stable.

## Adapter guidance

Use the stable v6 API for production unless the target repository explicitly uses v7 alpha; own the Sequelize instance lifecycle; use transactions for integrity; avoid sync-driven production schema changes; pin dialect/driver versions.
