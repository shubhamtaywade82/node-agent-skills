# Wave 19 — fixture repository + behavioral test harness

Adds a real, runnable fixture backend under `examples/` and exercises the skill loader + skills against it. Converts the runtime layer from "tested against synthetic fixtures" to "tested against a real Node codebase."

## Scope

### Fixture repository: `examples/ecommerce-api/`

A deliberately small Fastify + Postgres + BullMQ + zod + pino backend demonstrating the skills in concrete code.

- `package.json` — fastify, pg, bullmq, zod, pino, ioredis.
- `migrations/001-init.sql` — UNIQUE/CHECK/FK constraints, transactional outbox table, partial index for unpublished events.
- `src/validation/schemas.js` — zod at the boundary, `z.strict()`, bounded lengths, `z.infer` for types.
- `src/observability/logger.js` — structured JSON logs, redaction paths, level from env.
- `src/persistence/orders.js` — one client per transaction, atomic order + outbox insert, `FOR UPDATE SKIP LOCKED` for relay drain.
- `src/jobs/outbox-relay.js` — bounded retries, DLQ after max attempts, exponential backoff, graceful shutdown.
- `src/routes/orders.js` — one error boundary, canonical envelope, correlation id, 4xx vs 5xx classification.
- `src/server.js` — Fastify bootstrap, `/healthz` + `/readyz`, SIGTERM/SIGINT graceful shutdown.
- `test/orders.persistence.test.mjs` — real DB integration tests (skipped when `DATABASE_URL` not set).
- `test/routes.validation.test.mjs` — handler unit tests via `fastify.inject`, no DB needed.
- `README.md` — cross-references every skill demonstrated by each file.

### Behavioral test harness

- `test/fixture_repository_contract.test.mjs` (6 tests) — verifies the skill loader detects the fixture's declared adapters (fastify, pg, bullmq, zod, pino) and routes prompts to the correct primary skill when given the fixture repo path.
- Updated `package.json` `scripts.test` to `node --test test/*.test.mjs` to scope discovery to the pack's own tests (the fixture tests under `examples/` have their own `npm test` and require `npm install`).

### CI workflow enhancement

- `.github/workflows/validate.yml` adds two fixture smoke tests:
  1. Adapter detection: `node bin/skills.mjs detect-repo examples/ecommerce-api` must return all 7 declared adapters.
  2. Prompt routing: `node bin/skills.mjs route "add a transactional outbox..." --repo examples/ecommerce-api` must return `node-transactional-outbox` or `node-postgresql-persistence` as primary.

## Verification

- `npm test`: 182 tests pass (up from 176).
- `npm run validate`: 338 skills + 95 adapters.
- `npm run pack:export`: 535 files, manifest + checksums.
- Skill loader smoke: route + list + show all work.
- MCP server smoke: initialize + tools/list + tools/call over stdio.
- Fixture adapter detection: 7/7 declared adapters detected.
- Fixture prompt routing: "transactional outbox" → `node-transactional-outbox` primary.

## Numbers

- Skills: 338 (unchanged).
- Adapters: 95 (unchanged).
- Tests: 176 → 182 (+6 fixture contract tests).
- Files in pack export: 535 (up from 525; +10 fixture files).
- Examples directory: 0 → 1 fixture repo.

## What this proves

The skills in the pack are not theoretical — they map directly to concrete code patterns. Each file in `examples/ecommerce-api/` cross-references the skill it demonstrates. The runtime loader correctly detects the fixture's adapters from `package.json` and routes prompts to the owning primary. A consumer can clone this pack, run `node bin/skills.mjs detect-repo examples/ecommerce-api`, and see the loader work against a real codebase.

## Deferred to wave 20+

- LLM-as-judge harness: replace the routing-string matcher with an LLM-as-judge evaluation that scores agent *output*, not routing declarations. Reuse the 441 existing eval cases as the prompt corpus. Requires an LLM API key.
- Per-skill semver: add `version: 0.1.0` per skill entry and a Changesets workflow.
- De-duplicate boilerplate: extract the shared "Repository inspection" / "Failure modes" / "Verification" lines that appear in 18-27 skills into `references/agent-discipline.md`.
- Detailed retrospective wave plans for waves 5-14.
- A second fixture: an edge worker (Cloudflare Workers or Vercel Edge) to exercise `node-edge-runtime-foundations` and `node-llm-streaming`.
