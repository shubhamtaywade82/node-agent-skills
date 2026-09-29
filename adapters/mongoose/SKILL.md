---
name: adapter-mongoose
description: Use when the repository uses Mongoose.
---

# Mongoose adapter

## Purpose

Translate framework-neutral Node.js persistence/workflow guidance into Mongoose-specific mechanics.

## Activate when

- Mongoose is present in the target repository.
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

1. Detect Mongoose and exact version.
2. Map the change to the owning core persistence skill.
3. Apply Mongoose-specific lifecycle/query/transaction mechanics.
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

https://mongoosejs.com/docs/

## Version scope

8.x.

## Adapter guidance

Reuse connections/models; keep schema validation separate from authorization; understand defaults, middleware, populate, and transaction/session behavior; avoid accidental collection-wide updates; test lean/document semantics and index readiness.
