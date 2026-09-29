---
name: node-migrations
description: Use when changing production database schemas, writing migrations, backfilling data, removing columns, or coordinating schema changes across multiple application versions.
---

# Database Migrations

## Purpose
Treat migrations as compatibility work, not merely schema editing. Production deployments may run old and new application versions concurrently.

## Activate when
- Adding, removing, or renaming columns, indexes, constraints, tables, or enum values.
- Backfilling existing rows.
- Deploying schema changes with zero or low downtime requirements.

## Repository inspection
Inspect migration tooling, deploy order, rollback or roll-forward convention, production database size, lock duration, concurrent application versions, and migration history.

## Decision rules
| Concern | Rule |
|---|---|
| Compatibility | New schema must work with the currently deployed app before new app rollout. |
| Destructive change | Split destructive changes until all readers/writers are removed. |
| Backfill | Batch large backfills; avoid holding long locks. |
| Indexes | Use online/concurrent mechanisms where database/version supports them and traffic requires them. |
| Defaults | Verify database-specific rewrite and lock behavior before rollout. |
| Rollback | Prefer roll-forward-compatible recovery; do not assume arbitrary DDL rollback is safe. |

## Implementation procedure
1. Classify the change as additive, compatible transformation, or destructive.
2. Use expand-contract for incompatible replacements.
3. Deploy schema expansion.
4. Deploy application code that can read/write both representations if needed.
5. Backfill incrementally and observe progress.
6. Switch reads/writes, verify usage, then contract old schema.

## Failure modes
- Rename breaks old binaries during mixed-version deploys.
- Large migration blocks production traffic.
- Backfill runs in one huge transaction.
- Rollback assumes dropped data can be restored.
- Multiple deploys race to apply incompatible migrations.

## Verification
Test migration ordering against old/new app versions, lock impact, resume/retry behavior, partial backfill, and cleanup.

## Sources
- https://www.postgresql.org/docs/current/ddl-alter.html
