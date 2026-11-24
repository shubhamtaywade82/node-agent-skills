---
name: node-database-engineering
description: Use when designing relational persistence, SQL schemas, constraints, indexes, tenant isolation, query behavior, or ORM-backed database changes where correctness depends on database semantics.
license: MIT
---

# Database Engineering

## Purpose

Treat the database as an integrity boundary and source of durable truth. ORM types improve ergonomics; they do not replace SQL constraints, transaction semantics, or query-plan awareness. The division of labor: the database guarantees invariants under concurrency; the application validates inputs and shapes queries.

## Activate when

- Adding or changing tables, indexes, foreign keys, unique constraints, or query patterns.
- Introducing an ORM model for a relational database.
- Fixing duplicate data, race conditions, slow queries, or tenant-isolation defects.

## Boundary with related skills

- Use `node-database-engineering` for schema, constraint, index, and query design.
- Use `node-migrations` for the migration mechanics and rollout sequencing.
- Use `node-transactions` for the atomic-unit semantics over this schema.
- Use `node-postgresql-persistence` / `node-database-advisory-locks` for PostgreSQL-specific deep dives.
- Use `node-runtime-validation` for the input validation layer in front of queries.

## Repository inspection

Inspect schema/migrations, database engine/version, ORM, transaction helpers, connection pools, indexes, foreign keys, row-level security where used, and integration-test infrastructure. Confirm the actual database version — index features (partial, covering, expression) and isolation semantics vary by version.

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

Index decision guide:

| Pattern | Index shape |
|---|---|
| Equality filter, high frequency | B-tree on the filter column(s); composite with the tenant column first for scoped queries |
| Filter + sort (`WHERE tenant ORDER BY created_at DESC`) | Composite (tenant_id, created_at DESC) — index provides both filter and order |
| Partial invariant (`unique WHERE deleted_at IS NULL`) | Partial unique index — soft-delete safe |
| Covering hot read (`SELECT a, b WHERE c`) | Include (a, b) in the index (covering) after measuring |
| JSONB path filter | Expression index on the extracted path, not the whole column |

Tenant isolation enforcement ladder (strongest first): row-level security policy; composite primary keys and unique constraints scoped by tenant_id; ORM default scope + repository audit. Choose at least the second rung; scopes alone are an application promise, not a guarantee.

## Implementation procedure

1. State the data invariant being protected.
2. Decide which part is guaranteed by the DB versus application validation.
3. Add schema constraints and indexes when they define correctness.
4. Implement repository queries against explicit, validated inputs.
5. Verify plans for high-volume paths.
6. Add integration tests that exercise real database behavior.

**Reference example** — a multi-tenant orders schema where the database enforces the invariants:

```sql
CREATE TABLE orders (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id    text   NOT NULL,
  customer_ref text   NOT NULL,
  status       text   NOT NULL CHECK (status IN ('open', 'paid', 'shipped')),
  total_cents  bigint NOT NULL CHECK (total_cents >= 0),
  deleted_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- tenant-scoped identity: uniqueness enforced by the DB, safe under concurrency
  UNIQUE (tenant_id, customer_ref),
  FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE RESTRICT
);

-- Partial unique index: soft-deleted rows don't block ref reuse
CREATE UNIQUE INDEX orders_open_customer
  ON orders (tenant_id, customer_ref)
  WHERE deleted_at IS NULL;

-- Composite index serves the dominant query: filter + order in one structure
CREATE INDEX orders_tenant_status_created
  ON orders (tenant_id, status, created_at DESC);

-- Row-level security as the strongest tenant-isolation rung
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id')::text);
```

```ts
// Repository: parameterized, tenant-scoped, plan-friendly
export async function listOpenOrders(tenantId: TenantId, page: Page): Promise<Order[]> {
  // Set the RLS tenant context for this connection/transaction
  await db.exec(`SET LOCAL app.tenant_id = $1`, [tenantId]);
  return db.query(Order, {
    where: { status: "open" },                    // tenant filter comes from RLS + composite key
    orderBy: { createdAt: "DESC" },               // matches the composite index order
    limit: page.size, offset: page.offset,
  });
}

// Atomic state transition — no check-then-act
export async function markPaid(tenantId: TenantId, orderId: OrderId): Promise<number> {
  const result = await db.exec(
    `UPDATE orders SET status = 'paid'
     WHERE tenant_id = $1 AND id = $2 AND status = 'open'`,
    [tenantId, orderId]);
  return result.rowCount;          // 0 = already paid/absent; caller maps to 409/404
}
```

## Failure modes

- Uniqueness enforced only in application code — two concurrent requests both pass the check.
- Tenant filters omitted from one query path — cross-tenant data leak discovered by a customer.
- Index added without checking the actual predicate/order — a (status) index never serves `WHERE tenant AND status ORDER BY created_at`.
- ORM serialization exposes internal columns (tenant_id, soft-delete metadata, internal flags) through the public API.
- Long transactions hold locks while waiting on network calls (see `node-transactions`).
- NULL semantics surprise: `UNIQUE` allows multiple NULLs; `deleted_at IS NULL` partial index is the fix, not application discipline.
- N+1 query patterns from lazy ORM relations in a list path — visible only with query logging in tests.

## Verification

Test concurrent writers (two sessions race the same transition — one wins), duplicate inserts (second hits the constraint, mapped to 409), null/foreign-key violations (rejected by the DB, not just the app), tenant cross-access (RLS/policy blocks cross-tenant reads even when the query forgets the filter), representative query plans (`EXPLAIN (ANALYZE, BUFFERS)` — index used, no seq scan on the hot path), and transaction rollback behavior. Run against a real PostgreSQL (testcontainers or a CI service), not a mock.
