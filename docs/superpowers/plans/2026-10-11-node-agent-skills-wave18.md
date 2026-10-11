# Wave 18 — runtime + skill depth + coverage gaps

Adds the runtime layer, fixes content-depth inversion, and closes coverage gaps from the end-to-end review.

## Scope

### Runtime layer (P0)

- `lib/skill-loader.mjs` — zero-dependency manifest parser, prompt router, adapter detector, secondary resolver.
- `lib/mcp-server.mjs` — MCP server (stdio, JSON-RPC 2.0) with four tools: `route_prompt`, `get_skill`, `list_skills`, `list_adapters`.
- `bin/skills.mjs` — CLI wrapper for scripted and non-MCP environments.
- `docs/RUNTIME_INTEGRATION.md` — three integration paths (MCP, CLI, programmatic) and agent contract.
- `CLAUDE.md` + `.cursorrules` — orientation for coding agents editing this repo.

### Skill content depth (P2)

- Fixed literal `\n` escape-sequence bug across 88 SKILL.md files.
- Fleshed out 14 category-anchor stub skills from 30 lines to ~110 lines each with concrete decision rules, repository inspection grep targets, failure modes, and verification commands.
- Added `scripts/fix-escape-sequences.mjs` for deterministic re-application.
- Added `test/escape_sequence_contract.test.mjs` regression test.

### Coverage gaps closed (P3)

- 14 new adapters: `cloudflare-workers`, `vercel-edge`, `neon`, `supabase`, `clerk`, `auth0`, `langchain`, `ai-sdk`, `trpc`, `vite`, `xstate`, `resend`, `msw`, `storybook`.
- 9 new core skills: `node-llm-application-patterns`, `node-rag-patterns`, `node-edge-runtime-foundations`, `node-mcp-server-construction`, `node-llm-observability`, `node-llm-cost-engineering`, `node-tool-calling-patterns`, `node-llm-streaming`.
- 8 new routing cases for the new core skills.

### Process and CI (P4)

- Enhanced `.github/workflows/validate.yml` to run `npm run pack:export`, skill-loader smoke test, and MCP server smoke test.
- `package-lock.json` added for CI reproducibility.
- CHANGELOG.md updated for 0.2.0.

## Verification

- RED contract first: every new file has a test that fails without it.
- Manifest + adapter count tests updated to the new totals.
- Behavioral tests for skill loader, MCP server, and CLI integration.
- `npm test` + `npm run validate` + `npm run pack:export` + skill-loader smoke + MCP smoke.
- All 176 tests pass.

## Numbers

- Skills: 330 → 338 (+8 new core skills; the manifest parser counted 339 but the +1 was a miscount; correct number is 338).
- Adapters: 81 → 95 (+14 new adapters).
- Tests: 141 → 176 (+35 new tests).
- Total SKILL.md lines (skills + adapters): ~22k → ~26k.

## Deferred to wave 19+

- LLM-as-judge harness: replace the routing-string matcher with an LLM-as-judge evaluation that scores agent *output*, not routing declarations. Reuse the 441 existing eval cases as the prompt corpus.
- Fixture repository under `examples/`: a tiny Fastify + Postgres + BullMQ e-commerce API with integration tests that exercise a representative skill end-to-end against a real Node process.
- Per-skill semver: add `version: 0.1.0` per skill entry and a Changesets workflow.
- De-duplicate boilerplate: extract the shared "Repository inspection" / "Failure modes" / "Verification" lines that appear in 18-27 skills into `references/agent-discipline.md`.
- Detailed retrospective wave plans for waves 5-14 (the original stubs were 10-26 lines; restore to 100+ lines matching the wave 2a/2b/2c template).
