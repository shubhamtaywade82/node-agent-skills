---
name: node-integration-testing
description: Use when verifying Node.js code against real persistence, queues, HTTP servers, caches, or external boundary behavior instead of isolated mocks.
license: MIT
---

# Integration Testing

## Purpose

Provide a focused production boundary for integration testing without unnecessary architectural machinery. Integration tests answer the question unit tests cannot: does the code work against the real thing — real SQL semantics, real HTTP wire behavior, real queue redelivery — where mocks encode assumptions instead of proving them.

## Activate when

- The repository contains the problem described by this skill.
- A change crosses the relevant application or infrastructure boundary.
- Existing tests do not fully prove the required contract.

## Boundary with related skills

- Use `node-integration-testing` for the harness and strategy of boundary-testing against real dependencies.
- Use `node-contract-testing` when the dependency is another service's contract (consumer/provider pairs) rather than an infrastructure boundary.
- Use `node-test-fixture-repositories` for fixture-repo construction (example repos exercising real behavior).
- Use `node-testing` for the unit-layer philosophy and test architecture.

## Repository inspection

Inspect the owning module, public interfaces, runtime/dependency configuration, tests, persistence or network boundaries, observability, and local conventions. Key questions: which dependencies have integration tests today (docker-compose, testcontainers, or CI services), how tests get isolated (per-test database, per-worker schema, or per-suite namespace), and how slow tests are marked/gated.

## Decision rules

- Keep ownership at the smallest module boundary that owns the contract.
- State invariants and externally observable behavior before implementation.
- Keep dependencies explicit and lifecycle ownership clear.
- Validate untrusted inputs at boundaries; preserve domain invariants internally.
- Make failure, compatibility, concurrency, and observability semantics explicit.
- Prefer the simplest design that satisfies the actual contract.

Dependency-matrix decisions:

| Dependency | Real in integration tests? | Mechanism |
|---|---|---|
| PostgreSQL | Yes — always | testcontainers or CI service; real SQL semantics are the point |
| HTTP routes (in-process) | Yes | supertest/fastify.inject — real routing, serializers, hooks |
| External HTTP APIs | No | WireMock/MSW-style stub with contract fidelity, or a contract test |
| Queues | Yes | testcontainers broker; redelivery/nack semantics must be real |
| Cache (Redis) | Yes for TTL/atomic-op tests | testcontainers; key-flushed namespace per test |
| Time | Controlled | Fake clocks; real time only for duration smoke tests |

- Isolation by construction, not by discipline: each test gets its own database/schema or unique namespace — cleanup helpers that require developers to remember ordering rot immediately.
- Integration tests are a separate suite from unit tests: `npm run test:integration` with its own timeout budget; unit suites stay sub-second so the feedback loop survives.

## Implementation procedure

1. Identify the owning boundary and existing conventions.
2. Write the smallest failing test for the missing behavior.
3. Implement the owning boundary and its dependencies.
4. Exercise relevant failure, security, concurrency, and compatibility paths.
5. Verify at the boundary where users or other systems observe the result.
6. Remove accidental complexity and document only durable decisions.

**Reference example** — a PostgreSQL-backed integration harness with per-test isolation and a contract-style assertion:

```ts
// test/integration/helpers.ts — isolation by construction
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { migrate } from "../../scripts/migrate.js";

let container, db;
before(async () => {                                  // suite scope: one container
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  db = connect(container.getConnectionUri());
  await migrate(db);
});
after(async () => { await container?.stop(); });

export async function isolatedDb() {                  // per-test: private schema
  const schema = `t_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await db.exec(`CREATE SCHEMA ${schema}`);
  await db.exec(`SET search_path TO ${schema}`);      // migrations apply into schema
  await migrate(db);
  const tx = db.transaction();
  return { db, rollback: async () => tx.rollback() }; // or truncate-based cleanup
}

// test/integration/orders.integration.test.ts
test("marks an order paid exactly once under concurrent transitions", async () => {
  const { db, rollback } = await isolatedDb();
  try {
    const orderId = await seedOrder(db, { status: "open" });

    const results = await Promise.all([
      orders.markPaid(orderId),                       // via repository — real SQL
      orders.markPaid(orderId),                       // concurrent duplicate
    ]);

    assert.equal(results.filter((n) => n === 1).length, 1);   // exactly one transition
    assert.equal(results.filter((n) => n === 0).length, 1);   // other sees terminal state
    const row = await db.queryOne(`SELECT status FROM orders WHERE id = $1`, [orderId]);
    assert.equal(row.status, "paid");                 // DB state, not mock state
  } finally {
    await rollback();
  }
});
```

```jsonc
// package.json — separate budgets, separate commands
{
  "scripts": {
    "test": "node --test test/unit/**/*.test.mjs",
    "test:integration": "node --test --test-timeout=30000 test/integration/**/*.test.mjs"
  }
}
```

## Failure modes

- Framework or infrastructure details leak across the owning boundary (tests importing the ORM internals instead of the repository's public exports).
- Tests verify implementation details rather than observable behavior — assert on rows and responses, not on the SQL the ORM emitted.
- Global mutable state hides dependency ownership (module-level connections surviving tests; the order of test files decides outcomes).
- Failure and cleanup behavior is left implicit — leaked containers/schemas exhaust CI resources.
- Mocks standing in for the database in "integration" tests — re-encoding the assumption the test exists to check.
- Shared databases with truncate-between-tests — parallel workers race; isolation by construction (schema/namespace per test) removes the ordering dependency.
- Slow integration suites mixed into the fast path — developers stop running the full suite.

## Verification

- Focused contract tests pass.
- Integration/E2E or operational checks cover cross-process boundaries when applicable.
- Security, observability, compatibility, and resource behavior are reviewed before shipping.

For the harness itself: parallel workers run without cross-test interference (run the suite with `--test-parallel-ids` or concurrent CI shards twice to prove determinism), container/namespace teardown verified by resource counts after the run, and the suite's wall-clock budget tracked so the fast feedback loop survives growth.
