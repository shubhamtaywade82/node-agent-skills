# Wave 20 — remaining deferred items

Completes every deferred item from the wave 18 plan: per-skill semver, boilerplate extraction, second fixture (edge worker), wave plan restoration, and LLM-as-judge harness.

## Scope

### Wave 20a — Per-skill semver + Changesets

- New skill: `node-skill-pack-per-skill-versioning` (tooling category).
- `scripts/add-skill-versions.mjs`: idempotent script that adds `version: 0.1.0` to every skill entry that does not already have one.
- All 339 skills now carry a `version` field.
- `.changeset/config.json` + `.changeset/README.md`: changesets configuration.
- `.github/workflows/release.yml`: changesets-action Release PR workflow.
- `test/per_skill_version_contract.test.mjs` (4 tests): enforces the version field contract.

### Wave 20b — Shared boilerplate extraction

- `references/agent-discipline.md`: shared canonical content for Repository inspection, Decision rules, Failure modes, and Verification sections that were duplicated across 18+ skills.
- `scripts/dedupe-boilerplate.mjs`: idempotent script that removes exact-match shared lines from skill files and appends a pointer to the shared reference.
- De-duplicated 21 skill files; removed 111 shared lines.
- `scripts/export-pack.mjs` updated to include `references/agent-discipline.md`, `docs/RUNTIME_INTEGRATION.md`, and `CLAUDE.md` in requiredFiles.
- `test/agent_discipline_contract.test.mjs` (4 tests): verifies the reference file and dedup pattern.

### Wave 20c — Cloudflare Workers edge fixture

- `examples/edge-worker/`: a Cloudflare Workers backend with Workers AI, KV, Durable Objects, and a cron trigger.
- `wrangler.toml`: bindings for KV, Durable Object (LeaderDO), Workers AI, cron.
- `src/index.js`: fetch + scheduled handlers; demonstrates `node-edge-runtime-foundations`, `node-http-engineering`, `node-runtime-validation`, `node-async-concurrency`, `node-llm-streaming`, `node-distributed-locks`, `node-production-runtime`.
- `test/handler.contract.test.mjs`: 11 tests covering health, readyz, summarize SSE stream, validation, DO acquire/release.
- `test/edge_worker_fixture_contract.test.mjs` (6 tests): verifies the skill loader detects the fixture's adapters and routes prompts to the correct primary.

### Wave 20d — Wave plan restoration

- Restored detailed retrospective plans for waves 5–14 from 10–26 line stubs to ~58–66 lines following the wave 2a/2b/2c engineering-discipline template.
- Each plan documents: Goal, Architecture, Tech Stack, Spec, Global Constraints, Review Focus, Tasks (with file/skill creation, adapter creation, routing/evaluation coverage), Completion gate.

### Wave 20e — LLM-as-judge harness

- `lib/llm-judge.mjs` (170 lines): judge harness that uses z-ai-web-dev-sdk to score agent routing decisions against the existing eval corpus.
- `scripts/eval-llm-judge.mjs`: CLI wrapper with `--cases`, `--limit`, `--concurrency` flags.
- `package.json scripts.eval:llm-judge` added.
- `test/llm_judge_contract.test.mjs` (13 tests): verifies the harness with a mock ZAI client (no real LLM call). The deterministic evaluator remains the CI default; the LLM judge is opt-in.

## Verification

- `npm test`: 209 tests pass (up from 182).
- `npm run validate`: 339 skills + 95 adapters.
- `npm run pack:export`: 539 files.
- Skill loader detects adapters in both fixtures.
- Per-skill version field enforced by contract test.
- LLM judge harness wires correctly with mock ZAI client.

## Numbers

- Skills: 338 → 339 (+1: `node-skill-pack-per-skill-versioning`).
- Adapters: 95 (unchanged).
- Tests: 182 → 209 (+27 across all sub-waves).
- Files in pack export: 535 → 539 (+4: references/, RUNTIME_INTEGRATION.md, CLAUDE.md).
- Examples directory: 1 → 2 fixtures.

## What this completes

All deferred items from the wave 18 plan are now landed:
- ✅ Per-skill semver + Changesets workflow.
- ✅ De-duplicate boilerplate to shared references/.
- ✅ Second fixture (edge worker).
- ✅ Detailed wave plans for waves 5–14.
- ✅ LLM-as-judge harness scaffold.

No further deferred items remain. The pack is at feature parity with the wave 18 plan's complete vision.
