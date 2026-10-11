# Changelog

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
