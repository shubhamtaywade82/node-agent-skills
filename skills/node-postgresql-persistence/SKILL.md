---
name: node-postgresql-persistence
description: persistence
---

# Node Postgresql Persistence

## Purpose
Use when Node.js backend work changes PostgreSQL schemas, SQL queries, transactions, locks, indexes, connection pools, or persistence integrity.

## Activate when
Use database-enforced integrity, explicit transaction ownership, and measured query behavior.

## Repository inspection
- Schema or migration changes.
- Transaction changes.
- Database performance work.

## Decision rules
Inspect migrations, constraints, indexes, query code, transaction helpers, ORM/query builder, pool settings, and database limits.

## Implementation procedure
- Put critical invariants in database constraints.
- Keep transactions short.
- Never hold a transaction across an external network call.
- Inspect query plans before performance-driven indexes.
- Match pool concurrency to database capacity.
- Prefer atomic database operations for race-sensitive state.

## Failure modes
1. State the invariant.
2. Choose constraints and transaction boundary.
3. Write the migration safely.
4. Implement the smallest persistence seam.
5. Add real database integration tests for database-specific behavior.
6. Inspect query plans for measured hot paths.

## Verification
- Application-only uniqueness.
- Long transactions containing network calls.
- Oversized pools.
- ORM-hidden N+1 or locking behavior.

## Source foundation
Run migration checks, integration tests, constraint failures, rollback tests, and query-plan verification where applicable.
