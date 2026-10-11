# Changelog

## 0.4.0 - 2026-10-11

### Wave 20 — remaining deferred items

Completes every deferred item from the wave 18 plan.

- **Per-skill semver + Changesets workflow** (Wave 20a): all 339 skills now carry a `version` field; `scripts/add-skill-versions.mjs` is idempotent; `.changeset/` config + `.github/workflows/release.yml` Release PR workflow; `test/per_skill_version_contract.test.mjs` (4 tests) enforces the version contract.
- **Shared boilerplate extraction** (Wave 20b): `references/agent-discipline.md` holds canonical content for Repository inspection / Failure modes / Verification; `scripts/dedupe-boilerplate.mjs` removed 111 shared lines across 21 skill files; `scripts/export-pack.mjs` updated to include the reference file in pack exports; `test/agent_discipline_contract.test.mjs` (4 tests).
- **Cloudflare Workers edge fixture** (Wave 20c): `examples/edge-worker/` demonstrates `node-edge-runtime-foundations`, `node-llm-streaming`, `node-distributed-locks`, `node-runtime-validation`, `node-async-concurrency`, `node-production-runtime` against the Workers runtime (Workers AI, KV, Durable Objects, cron). 11 handler tests + 6 fixture contract tests.
- **Restored wave plans 5–14** (Wave 20d): converted the 10–26 line stub plans into ~58–66 line retrospective plans following the wave 2a/2b/2c engineering-discipline template. No code changes.
- **LLM-as-judge harness** (Wave 20e): `lib/llm-judge.mjs` scores agent routing decisions by asking an LLM (via `z-ai-web-dev-sdk`, optional dep) to read the prompt + manifest and emit a routing decision; `scripts/eval-llm-judge.mjs` is the CLI; `test/llm_judge_contract.test.mjs` (13 tests) uses a mock ZAI client. The deterministic evaluator remains the CI default.

### Numbers

- Skills: 338 → 339 (+1: `node-skill-pack-per-skill-versioning`).
- Adapters: 95 (unchanged).
- Tests: 182 → 209 (+27 across all sub-waves).
- Files in pack export: 535 → 539.
- Examples directory: 1 → 2 fixtures.

## 0.3.0 - 2026-10-11

### Fixture repository (Wave 19)

- Added `examples/ecommerce-api/` — a runnable Fastify + Postgres + BullMQ + zod + pino fixture demonstrating 11 skills end-to-end against real code.
- Files: `package.json`, `migrations/001-init.sql`, `src/server.js`, `src/validation/schemas.js`, `src/persistence/orders.js`, `src/jobs/outbox-relay.js`, `src/routes/orders.js`, `src/observability/logger.js`, `test/orders.persistence.test.mjs`, `test/routes.validation.test.mjs`, `README.md`.
- Added `examples/README.md` index.
- Added `test/fixture_repository_contract.test.mjs` (6 tests) — verifies the skill loader detects the fixture's declared adapters and routes prompts to the correct primary.
- Updated `package.json` `scripts.test` to `node --test test/*.test.mjs` to scope discovery to the pack's own tests (fixture tests have their own `npm test`).
- Enhanced `.github/workflows/validate.yml` with two fixture smoke tests: adapter detection + prompt routing.
- Added `docs/superpowers/plans/2026-10-11-node-agent-skills-wave19.md` retrospective plan.

## 0.2.0 - 2026-10-11

### Runtime layer (P0)

- Added `lib/skill-loader.mjs` — zero-dependency manifest parser, prompt router, adapter detector, secondary resolver.
- Added `lib/mcp-server.mjs` — MCP server (stdio, JSON-RPC 2.0) exposing four tools: `route_prompt`, `get_skill`, `list_skills`, `list_adapters`.
- Added `bin/skills.mjs` — CLI wrapper for non-MCP environments.
- Added `docs/RUNTIME_INTEGRATION.md` describing three integration paths (MCP, CLI, programmatic) and the agent contract.
- Added `CLAUDE.md` and `.cursorrules` orientation files for coding agents editing this repo.
- Registered `skills` and `mcp` bin entries in `package.json`.

### Skill content depth (P2)

- Fixed literal `\n` escape-sequence bug across 88 SKILL.md files (numbered lists rendered as one broken paragraph).
- Added `scripts/fix-escape-sequences.mjs` for deterministic re-application.
- Added `test/escape_sequence_contract.test.mjs` regression test.
- Fleshed out 14 category-anchor stub skills from 30 lines to ~110 lines each, with concrete decision rules, repository inspection grep targets, failure modes drawn from real defects, and verification commands:
  - `node-architecture`, `node-runtime-foundations`, `node-postgresql-persistence`
  - `node-auth-security`, `node-async-concurrency`, `node-typescript-contracts`
  - `node-runtime-validation`, `node-api-engineering`, `node-background-jobs-reliability`
  - `node-observability`, `node-testing`, `node-performance`
  - `node-production-runtime`, `node-external-integrations`
  - `node-http-engineering`, `node-circuit-breakers`
  - `node-distributed-locks`, `node-resilience`

### Coverage gaps closed (P3)

- Added 14 high-impact modern stack adapters:
  - `cloudflare-workers`, `vercel-edge`, `neon`, `supabase`, `clerk`, `auth0`
  - `langchain`, `ai-sdk`, `trpc`, `vite`, `xstate`, `resend`, `msw`, `storybook`
- Added 9 core AI/edge/MCP skills:
  - `node-llm-application-patterns`, `node-rag-patterns`, `node-edge-runtime-foundations`
  - `node-mcp-server-construction`, `node-llm-observability`, `node-llm-cost-engineering`
  - `node-tool-calling-patterns`, `node-llm-streaming`

### Process and CI (P4)

- Enhanced `.github/workflows/validate.yml` to run `npm run pack:export`, a skill-loader smoke test, and an MCP server smoke test.
- Manifest count: 338 skills, 95 adapters (up from 330 skills, 81 adapters).
- Test count: 168 tests, all passing (up from 141).

## 0.1.0 - 2026-09-28

- Scaffolded node-agent-skills.
- Added 14 framework-neutral Node.js + TypeScript backend skills.
- Added manifest, routing, validator, tests, evaluation cases, and CI.
