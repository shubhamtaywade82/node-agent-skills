---
name: node-testing
description: Use when designing or changing Node.js unit, integration, API, contract, fuzz, or property tests.
---

# Node Testing

## Purpose

Tests prove behavior, not implementation. They must catch regressions, document intent, and survive refactors. Tests that mock the system under test prove nothing.

## Activate when

- Adding or changing unit, integration, or end-to-end tests.
- Choosing a test runner (`node --test`, `vitest`, `jest`).
- Adding contract tests (OpenAPI, Pact, JSON Schema).
- Adding property-based tests (fast-check) or fuzz tests.
- Setting up Testcontainers for real Postgres/Redis/SNS/localstack.
- Diagnosing flaky tests or slow suites.

## Repository inspection

1. Test runner — `package.json` `scripts.test`, `vitest.config.ts`, `jest.config.ts`, `tsconfig.test.json`. Confirm the runner.
2. Test files — find `*.test.ts`, `*.spec.ts`, `test/`, `__tests__/`. List the top 10 by size and the slowest 5 by runtime.
3. Coverage — `c8`, `vitest --coverage`, `jest --coverage`. Confirm coverage thresholds and the metric (lines, branches, functions).
4. Integration tests — grep for `testcontainers`, `docker-compose`, `beforeAll(() => { startPostgres }`. Confirm a real DB is used, not a mock.
5. Contract tests — grep for `pact`, `openapi` validator, `schema-validator`. Confirm the contract is enforced against a real or recorded response.
6. Fuzz/property — grep for `fast-check`, `fc.assert`, `fc.property`. Find the property tests.
7. Flakiness — read CI history; find tests that fail intermittently.

## Decision rules

| Concern | Rule |
|---|---|
| Behavior vs implementation | Test observable behavior through the public API, not internal functions. |
| Mock strategy | Mock the world outside the system under test (time, RNG, downstream services); never mock the system itself. |
| Integration tests | Use real dependencies where possible: Testcontainers Postgres, real Redis, localstack. |
| Unit tests | Pure functions and domain logic. Fast (< 10ms each), no I/O, no sleeps. |
| Coverage | Threshold ≥ 80% lines is a floor, not a target. 100% lines does not mean 100% behavior coverage. |
| Test isolation | Each test sets up and tears down its own state. Never depend on test order. |
| Test data | Use factories that produce valid random data; do not hard-code test fixtures. |
| Property tests | Use for pure functions, parsers, round-trip (serialize then deserialize = identity). |
| Contract tests | Producer and consumer both validate against the OpenAPI/JSON Schema contract. |
| Flaky tests | Fix immediately. A flaky test is a defect in the test or in the system; ignoring trains the team to ignore CI. |
| Slow tests | Tests > 1s should be < 10% of the suite. Tests > 10s should be a handful. |
| Async tests | Use `await`; never use real `setTimeout` in tests; use `vi.useFakeTimers()` or `sinon.useFakeTimers`. |
| Determinism | Same input → same output. Tests cannot depend on wall clock, network, or order. |

## Implementation procedure

1. State the behavior under test: "given X, when Y, then Z."
2. Pick the test layer: unit (pure logic), integration (real deps), contract (API shape), E2E (full user flow).
3. Write the test before the implementation when changing behavior (TDD) — it surfaces the contract.
4. Use Testcontainers for integration tests: spin up a real Postgres, run migrations, exercise the persistence layer.
5. Use factories for test data: `buildOrder()` returns a valid random order; override fields per test.
6. For property tests: define the invariant (`parse(serialize(x)) === x`); generate random inputs; run ≥ 1000 cases.
7. For contract tests: write the OpenAPI definition; assert every endpoint matches it; assert every consumer-side call uses the schema.

## Failure modes

- Mocking the system under test → tests pass but the system is broken.
- Real `setTimeout` in tests → flaky; CI runs slower than dev.
- Test depends on test order → renaming the file breaks CI.
- Hard-coded test fixtures → no longer representative; tests pass on stale data.
- Unit tests for everything → 1000 unit tests, 0 integration tests; production fails on the integration boundary.
- 100% line coverage celebrated while 0% behavior coverage on edge cases.
- Property test that always passes because the generator only produces trivial inputs.
- Pact contract test that the consumer never runs against the producer.
- Flaky test marked `.skip` instead of fixed → bug ships to production.
- Slow integration tests that share one DB → tests serialize, suite runtime explodes.
- Tests use a `test` user with no tenant isolation → cannot catch tenant bugs.

## Verification

- Run `npm test` locally; confirm it passes.
- Run `npm test -- --coverage` and inspect the uncovered lines; the uncovered lines are the next tests to write.
- Run the suite 10× in a row; flaky tests surface within a few runs.
- Run the suite in random order (`vitest --randomize`); order-dependent tests fail.
- Run the integration tests against a real Testcontainers DB; confirm migrations apply and the tests pass.
- Run the property tests with seed control (`fc.assert(fc.property(...), { seed: 1234 })`); confirm deterministic re-runs.
- Inspect slow tests (`vitest --reporter=verbose`); the slowest 5 are the next optimization target.
- Source references: https://nodejs.org/api/test.html, https://vitest.dev/guide/, https://jestjs.io/docs/getting-started, https://fast-check.dev/, https://testcontainers.com/, https://pact.io/.
