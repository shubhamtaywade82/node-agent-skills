# TODO

## Current work — production readiness pass

- [x] AGENTS.md raised to the full engineering-contract standard (13 sections added: domain change contracts, context rules, routing quality, design rules, skill-pack installation, benchmark integrity, CI toolchain maintenance, verification contract, skill precedence, release readiness, evaluation changes, repository completeness).
- [x] Merged the confirmed duplicate skill pairs: `node-file-system-safety` into `node-filesystem-safety`; `node-advisory-locks` into `node-database-advisory-locks`. Manifest, routing cases, and eval references now point only at the surviving owners.
- [x] `framework-drift.yml` added (deprecated Node.js/TypeScript APIs that skills must not recommend).
- [x] `TODO.md` added.
- [x] The node-to-react seam contract now points at the symmetric client-side seam skill `react-agent-skills/skills/react-node-integration` (previously pointed at `browser-authentication` as a stand-in).

## Consolidation candidates (RESOLVED 2026-11-24)

The `adapter_skills:` registry historically registered near-duplicate skills alongside the main `skills:` registry. Ownership decisions were made on issue #42 and executed: 16 skills retired, 338 → 322.

- Read replicas → owner `node-database-read-replicas`; retired `node-read-replica-routing`, `node-database-read-replica-routing`; `read-replica-routing` + `database-read-replica-routing` cases collapsed into one.
- Outbox → owner `node-transactional-outbox`; retired `node-outbox`.
- Deprecation → owner `node-api-deprecation`; retired `node-deprecation-management`, `node-deprecation-planning`.
- Migrations → owner `node-migrations`; retired `node-migration-assistant`, `node-database-migrations-production` (production-runbook mechanics folded in).
- Skill-pack governance (12 → 3): author side `node-skill-packaging` (absorbed format, source-governance, release), consumer side `node-skill-pack-installation` (absorbed compatibility, distribution), governance side `node-skill-pack-manifest-governance` (absorbed versioning, per-skill-versioning, routing-governance, evaluation-governance).

Survivors were enriched to the band depth baseline; manifest triggers, routing cases, eval corpora, and wave-contract count assertions were re-pointed in the same change.

## Missing infrastructure (create before benchmark campaigns)

- `benchmarks/` — no benchmark fixtures or campaign harness exists yet.
- `mcp/` — no MCP server definitions (compare ruby-agent-skills, which ships MCP tooling).
- `agent-recordings/` — no recorded agent runs for regression comparison.
- `patterns/` — implementation-pattern guidance currently lives in `references/`; either rename for cross-pack consistency or document the deviation in `AGENTS.md`.

## Skill depth

- [x] Highest-traffic routing targets enriched (production-readiness increment 2): `node-build-engineering` (26 routing cases), `node-repository-forensics` (22), `node-retry-timeouts` (9), `node-zero-downtime` (8), `node-idempotency` (7), `node-database-engineering` (6), `node-transactions` (6), `node-integration-testing` (6) — each now carries purpose, boundary-with-related-skills, decision tables, a complete reference example, failure modes, checklists, and source foundations.
- [x] Second band enriched (production-readiness increment 3, PR #40): `node-migrations` (5 routing cases), `node-event-driven-architecture` (5), `node-rest-api-design` (5), `node-openapi` (4) — same depth baseline, plus a refreshed react companion snapshot (`5f96069`).
- [x] Consolidation survivors enriched (issue #42 execution): `node-database-read-replicas`, `node-transactional-outbox`, `node-api-deprecation`, `node-migrations`, `node-skill-packaging`, `node-skill-pack-installation`, `node-skill-pack-manifest-governance` — each absorbed the retired scaffolds' distinctive guidance at the band depth baseline.
- The remaining ~303 skills are ~2 KB scaffolds. Continue enriching in routing-case-frequency order. `node-testing` (251 references) and `node-observability` (203) lead the raw counts because they are universal secondaries (listed in nearly every routing case); both are still ~80-line scaffolds, so treat them as a deliberate next-band decision: enrich them as always-loaded infrastructure, or keep them lean because they load everywhere. Next routing-demand band after that call: `node-runtime-validation` (15), `node-auth-security` (9), `node-production-runtime` (8), `node-http-engineering` (7), `node-async-concurrency` (7), then the 6× cluster (`node-external-integrations`, `node-typescript-contracts`, `node-architecture`, `node-llm-observability`). Keep each skill under 500 lines; move deep knowledge into skill-local `references/` one level deep.

## Cross-pack pinning

`cross_pack.companions` pins `react-agent-skills` to `main`. Pin to an immutable tag (matching the ruby pin at `v1.5.0`) before the next release, then record the resolved snapshot hashes.

## Scheduled recheck

- [x] react-agent-skills merged its production-readiness branch (squashed `6868b6a` via PR #23, then enrichment PRs #24/#25): `bin/cross-pack-verify.mjs --companions ..` passes with the node-to-react-client seam symmetric on both sides (`react-agent-skills/skills/react-node-integration`), and the companion snapshot tracks post-enrichment react main (`5f96069`; inventory unchanged by enrichment). Still open: the immutable-tag pin (see "Cross-pack pinning") — once react cuts its next release, re-run the verifier against the tag and record the resolved hashes.
