---
name: prisma
description: Use when a Node.js backend uses Prisma ORM 7.x or 8.x for relational data access, transactions, migrations, generated types, or connection management.
---

# Prisma Adapter

## Purpose
Translate framework-neutral database and transaction rules into Prisma-specific mechanics while keeping version differences explicit.

## Activate when
Detect Prisma packages and Prisma schema/configuration in the target repository. Verify the exact major before applying version-specific guidance.

## Repository inspection
Inspect prisma, @prisma/client, generated client location, Prisma configuration, migration history, datasource, database provider, connection setup, and transaction helpers.

## Decision rules
- Keep Prisma generated types inside persistence boundaries; do not use them as public API contracts by default.
- Prisma 8 currently requires Node.js 22.18+ or Node.js 24.11+ and TypeScript 5.9+; verify the target repository meets that floor before applying Prisma 8 guidance.
- Use the transaction mechanism appropriate to the workload: nested writes, batch operations, or interactive transactions.
- Keep interactive transactions short and avoid network calls or slow work inside them.
- Treat Prisma 7 and Prisma 8 guidance separately. Prisma 8 is currently a release candidate and still subject to API changes; Prisma 7 remains supported. 
- Use Prisma Migrate deployment commands for production migrations rather than development-only workflows.
- Preserve database constraints and indexes even when Prisma schema types look sufficient.

## Implementation procedure
1. Detect the installed Prisma major.
2. Inspect generated-client and migration configuration.
3. Map the use case to the smallest correct Prisma transaction technique.
4. Keep external side effects outside transactions or coordinate them through an outbox.
5. Verify migration SQL and production compatibility before deployment.

## Failure modes
- Prisma 8-only APIs are applied to a Prisma 7 project.
- Interactive transaction contains an outbound HTTP call.
- Generated Prisma model is serialized directly to clients.
- Development migration command is used as a production deploy step.
- Application-only uniqueness replaces a database constraint.

## Verification
Test real transaction behavior, rollback/concurrency, generated contract boundaries, migration application, and connection cleanup.

## Sources
- https://www.prisma.io/docs/orm/release-status
- https://docs.prisma.io/docs/orm/v7/prisma-client/queries/transactions
- https://docs.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production
- https://docs.prisma.io/docs/orm/migrations/how-migrations-work
