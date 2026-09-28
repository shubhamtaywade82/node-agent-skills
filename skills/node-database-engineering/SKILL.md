---
name: node-database-engineering
description: Use when designing relational persistence, SQL schemas, constraints, indexes, tenant isolation, query behavior, or ORM-backed database changes where correctness depends on database semantics.
---

# Database Engineering

## Purpose
Treat the database as an integrity boundary and source of durable truth. ORM types improve ergonomics; they do not replace SQL constraints, transaction semantics, or query-plan awareness.

## Activate when
- Adding or changing tables, indexes, foreign keys, unique constraints, or query patterns.
- Introducing an ORM model for a relational database.
- Fixing duplicate data, race conditions, slow queries, or tenant-isolation defects.

## Repository inspection
Inspect schema/migrations, database engine/version, ORM, transaction helpers, connection pools, indexes, foreign keys, row-level security where used, and integration-test infrastructure.

## Decision rules
| Concern | Rule |
|---|---|
| Integrity | Put critical uniqueness, nullability, referential, and check invariants in the database. |
| Tenant isolation | Make tenant scope explicit in keys, queries, constraints, or database policy. |
| Queries | Select only required data; never accept arbitrary SQL fragments from untrusted input. |
| Indexes | Design indexes from real filter/order/join patterns and verify with query plans. |
| Concurrency | Prefer atomic SQL constraints/updates or explicit locking over check-then-act logic. |
| ORM | Keep ORM records separate from public contracts when the boundary matters. |
| Transactions | Keep transactional work short and side-effect-free outside the database. |

## Implementation procedure
1. State the data invariant being protected.
2. Decide which part is guaranteed by the DB versus application validation.
3. Add schema constraints and indexes when they define correctness.
4. Implement repository queries against explicit, validated inputs.
5. Verify plans for high-volume paths.
6. Add integration tests that exercise real database behavior.

## Failure modes
- Uniqueness enforced only in application code.
- Tenant filters omitted from one query path.
- Index added without checking the actual predicate/order.
- ORM serialization exposes internal columns.
- Long transactions hold locks while waiting on network calls.

## Verification
Test concurrent writers, duplicate inserts, null/foreign-key violations, tenant cross-access, representative query plans, and transaction rollback behavior.
