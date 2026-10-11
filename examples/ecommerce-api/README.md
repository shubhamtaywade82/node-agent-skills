# ecommerce-api — fixture backend

A runnable, deliberately small backend demonstrating the **node-agent-skills** pack applied to a real codebase. Exercises these skills end-to-end:

| Skill | Demonstrated by |
|---|---|
| `node-http-engineering` | `src/routes/orders.js` — transport boundary, one error boundary, one lifecycle |
| `node-api-engineering` | `src/routes/orders.js` — canonical error envelope, idempotency key, 4xx vs 5xx |
| `node-runtime-validation` | `src/validation/schemas.js` — zod at the boundary, `z.strict()`, bounded lengths |
| `node-typescript-contracts` | `src/validation/schemas.js` — `z.infer` for type derivation |
| `node-postgresql-persistence` | `src/persistence/orders.js` — UNIQUE/CHECK/FK constraints, one client per transaction |
| `node-transactional-outbox` | `src/persistence/orders.js` + `src/jobs/outbox-relay.js` — atomic write + relay |
| `node-background-jobs-reliability` | `src/jobs/outbox-relay.js` — bounded retries, DLQ after max attempts |
| `node-idempotency` | migration `001-init.sql` — `UNIQUE (idempotency_key, customer_id)` |
| `node-observability` | `src/observability/logger.js` — structured JSON, redaction, correlation id |
| `node-production-runtime` | `src/server.js` — graceful shutdown, `/healthz` + `/readyz` probes |
| `node-async-concurrency` | `src/persistence/orders.js` — `client.release()` in `finally` |

## Run

```bash
# 1. Start a local Postgres (or use the DATABASE_URL of your choice)
docker run -d --name ecommerce-pg -e POSTGRES_DB=ecommerce \
  -e POSTGRES_HOST_AUTH_METHOD=trust -p 5432:5432 postgres:17

# 2. Apply migrations
DATABASE_URL=postgres://localhost/ecommerce psql -f migrations/001-init.sql

# 3. Install deps
npm install

# 4. Start the server
DATABASE_URL=postgres://localhost/ecommerce npm start

# 5. Run the integration tests (requires DATABASE_URL)
DATABASE_URL=postgres://localhost/ecommerce npm test
```

## Verify against the skill pack

From the **pack root** (not this directory):

```bash
# Detect adapters present in this fixture
node bin/skills.mjs detect-repo examples/ecommerce-api
# → should return: fastify, pg, bullmq, zod, pino, ioredis

# Route a prompt to the owning skill
node bin/skills.mjs route "add a transactional outbox for order creation" --repo examples/ecommerce-api
# → primary: node-transactional-outbox (or node-postgresql-persistence)
# → adapters detected from package.json
```

## What this fixture proves

The skills in `node-agent-skills` are not theoretical — they map directly to concrete code patterns. Each file in this fixture cross-references the skill it demonstrates. Run the integration tests to confirm the patterns work against a real Postgres; run the validation tests to confirm the contract boundary works without a DB.

## Layout

```
examples/ecommerce-api/
├── package.json              # fastify, pg, bullmq, zod, pino, ioredis
├── migrations/
│   └── 001-init.sql          # UNIQUE, CHECK, FK constraints; outbox table
├── src/
│   ├── server.js             # Fastify bootstrap + graceful shutdown
│   ├── validation/
│   │   └── schemas.js        # zod at the boundary; z.infer for types
│   ├── persistence/
│   │   └── orders.js         # transactional outbox; one client per tx
│   ├── jobs/
│   │   └── outbox-relay.js   # bounded retries; DLQ after max attempts
│   ├── routes/
│   │   └── orders.js         # one error boundary; correlation id
│   └── observability/
│       └── logger.js        # structured JSON; redaction
├── test/
│   ├── orders.persistence.test.mjs  # real DB integration tests
│   └── routes.validation.test.mjs    # contract boundary tests
└── README.md (this file)
```

## Not included (deliberately)

- Authentication — would pull in Clerk/Auth0, out of scope for the fixture.
- Real BullMQ worker — the relay publishes via `console.log` + simulated failure; swap for `await queue.add(...)` in a real service.
- Frontend — see the `react-agent-skills` companion pack for the client side.
- OpenAPI contract — see the `node-openapi` skill for the contract-first workflow.
