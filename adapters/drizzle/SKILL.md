---
name: drizzle
description: Use when a Node.js backend uses Drizzle ORM for SQL schema definition, transactions, migrations, relational queries, or database integration.
---

# Drizzle Adapter

## Purpose
Map framework-neutral relational database rules onto Drizzle's typed SQL approach without confusing TypeScript schema declarations with database-enforced invariants.

## Activate when
Detect drizzle-orm and drizzle-kit in package manifests/configuration. Verify the project version and migration-folder conventions.

## Repository inspection
Inspect schema files, dialect, drizzle.config, migration directory, database driver, transaction helpers, generated SQL, and CI migration commands.

## Decision rules
- Drizzle transactions provide a transaction callback and support nested transactions/savepoints; use them only for work that belongs to one atomic DB unit.
- Decide whether the database or TypeScript schema is the authoritative schema source.
- Prefer generated SQL migrations for reviewable production changes rather than direct schema pushes.
- Keep tenant constraints, unique indexes, foreign keys, and checks in the database where they define correctness.
- Treat raw SQL as a deliberate escape hatch and parameterize untrusted values.
- Keep network calls outside database transactions.

## Implementation procedure
1. Detect dialect and Drizzle version.
2. Inspect schema-to-migration flow.
3. Define constraints in the database.
4. Use the transaction API for atomic state changes.
5. Generate, review, and apply migrations through the project's deployment process.
6. Add integration tests against the actual database.

## Failure modes
- TypeScript declarations are assumed to enforce production integrity.
- drizzle-kit push is used for a production migration workflow that requires reviewable migration files.
- Transaction contains a remote API call.
- Raw SQL bypasses tenant or parameterization rules.
- Migration folder state is changed manually without history checks.

## Verification
Test transaction rollback, nested savepoints when used, generated migration correctness, constraints, and production migration application.

## Sources
- https://orm.drizzle.team/docs/transactions
- https://orm.drizzle.team/docs/migrations
- https://orm.drizzle.team/docs/drizzle-kit-migrate
