---
name: adapter-mysql2
description: Use when the repository uses MySQL2.
---

# MySQL2 adapter

## Purpose

Translate framework-neutral Node.js persistence/workflow guidance into MySQL2-specific mechanics.

## Activate when

- MySQL2 is present in the target repository.
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

1. Detect MySQL2 and exact version.
2. Map the change to the owning core persistence skill.
3. Apply MySQL2-specific lifecycle/query/transaction mechanics.
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

https://github.com/sidorares/node-mysql2

## Version scope

current 3.x.

## Adapter guidance

Use parameterized/prepared statements; reuse pools; release checked-out connections; choose promise APIs intentionally; configure SSL and timeouts explicitly; size pool capacity across replicas/workers; test transaction and connection-loss behavior.
