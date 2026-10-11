# Examples

Fixture repositories demonstrating the node-agent-skills pack against real code.

| Fixture | Stack | Skills exercised |
|---|---|---|
| `ecommerce-api` | Fastify + Postgres + BullMQ + zod + pino | http-engineering, api-engineering, runtime-validation, postgresql-persistence, transactional-outbox, background-jobs-reliability, idempotency, observability, production-runtime, async-concurrency |

Each fixture is independently runnable — `cd examples/<name> && npm install && npm start`. Each fixture's `README.md` cross-references the skills it demonstrates.

## Why fixtures matter

The skills in `node-agent-skills` are not theoretical — they map to concrete code patterns. The fixtures prove the patterns work against real runtimes (real Postgres, real Redis, real Node process). They also serve as a regression target for the runtime loader: from the pack root, `node bin/skills.mjs detect-repo examples/ecommerce-api` should return the adapters present in the fixture's `package.json`, and `node bin/skills.mjs route "<prompt>" --repo examples/ecommerce-api` should route to the owning skill and detect adapters.

## Adding a fixture

1. Create `examples/<name>/` with a `package.json` declaring the stack.
2. Implement a small but real backend (HTTP server, persistence layer, queue worker).
3. Add `migrations/` if the fixture uses a DB.
4. Add `test/` with at least one integration test against a real runtime.
5. Add `README.md` cross-referencing the skills demonstrated.
6. From the pack root, run `node bin/skills.mjs detect-repo examples/<name>` to confirm adapter detection.
