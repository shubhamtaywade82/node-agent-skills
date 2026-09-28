---
name: node-postgresql-persistence
description: Use when Node.js backend work changes PostgreSQL schemas, SQL queries, transactions, locks, indexes, connection pools, or persistence integrity.
---

# Node Postgresql Persistence

## Purpose
Use database-enforced integrity, explicit transaction ownership, and measured query behavior.

## Activate when
Change schemas/migrations, transaction behavior, query performance, locks, or pooling.

## Repository inspection
Inspect migrations, constraints, indexes, SQL/query code, transaction helpers, ORM/query builder, pool settings, and DB limits.

## Decision rules
Put critical invariants in constraints. Keep transactions short. Never hold transactions across network calls. Inspect query plans before performance-driven indexes. Match pool concurrency to database capacity. Prefer atomic DB operations for races.

## Implementation procedure
1. State invariant. 2. Choose constraints/transaction boundary. 3. Write safe migration. 4. Implement persistence seam. 5. Add real DB integration tests. 6. Inspect plans for hot paths.

## Failure modes
Application-only uniqueness; long transactions with network calls; oversized pools; ORM-hidden N+1 or locking behavior.

## Verification
Run migration checks, integration tests, constraint failures, rollback tests, and query-plan verification where applicable.

## Source foundation
https://www.postgresql.org/docs/current/ddl-constraints.html
