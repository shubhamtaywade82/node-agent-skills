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

## Missing infrastructure (RESOLVED 2026-11-24)

- [x] `benchmarks/` — campaign registry added: `benchmarks/README.md` (harness contract per the AGENTS.md benchmark-integrity rules) + `benchmarks/manifest.yml` (schema; executable fixture seams pinned to `examples/`, which the Validate smoke tests already exercise; `campaigns:` empty until a real campaign is recorded — no fabricated results).
- [x] `mcp/` — server definitions added: `mcp/README.md` + `mcp/permissions.yml`, a fail-closed capability policy classifying the five read-only tools the pack's MCP server (`lib/mcp-server.mjs`) actually exposes (`get_skill`, `route_prompt`, `route_cross_pack`, `list_skills`, `list_adapters`), following the cross-pack policy schema (schema_version 1, as ruby-agent-skills ships).
- [x] `agent-recordings/` — recording format contract added (`agent-recordings/README.md`): per-set layout with `baseline/` vs `skills/` recordings, the `recording.json` provenance schema (context fingerprints, agent identity), mirroring ruby-agent-skills' recorded-campaign format. No fabricated recordings; the directory fills when a campaign runs.
- [x] `patterns/` — deviation documented in AGENTS.md ("Repository completeness changes"): pattern guidance lives in `references/` in this pack by design; cross-pack tooling must treat the directory name as pack-specific.

## Skill depth

- [x] Highest-traffic routing targets enriched (production-readiness increment 2): `node-build-engineering` (26 routing cases), `node-repository-forensics` (22), `node-retry-timeouts` (9), `node-zero-downtime` (8), `node-idempotency` (7), `node-database-engineering` (6), `node-transactions` (6), `node-integration-testing` (6) — each now carries purpose, boundary-with-related-skills, decision tables, a complete reference example, failure modes, checklists, and source foundations.
- [x] Second band enriched (production-readiness increment 3, PR #40): `node-migrations` (5 routing cases), `node-event-driven-architecture` (5), `node-rest-api-design` (5), `node-openapi` (4) — same depth baseline, plus a refreshed react companion snapshot (`5f96069`).
- [x] Band 5 enriched (routing-demand tier): `node-runtime-validation` (15 routing cases), `node-auth-security` (9), `node-production-runtime` (8), `node-http-engineering` (7), `node-async-concurrency` (7) — their decision tables were already band-grade; each gained purpose prose, a boundary-with-related-skills section, and a compact load-bearing reference example (env+webhook schemas; authn middleware + policy function + RLS; deadline-bounded shutdown sequence; AsyncLocalStorage context + single error-envelope mapping; p-limit fan-out with `AbortSignal.any` deadline propagation).
- [x] Universal-secondaries decision (band 4): `node-testing` and `node-observability` are the always-loaded infrastructure tier — enriched with the missing baseline elements (purpose prose, boundary-with-related-skills, one compact load-bearing reference example each) while staying under a ~150-line cap, because they appear as secondaries in nearly every routing case and deep content would balloon context for every task. Policy going forward: universal secondaries are infrastructure tier (bounded depth, pointers to specialists); the depth bands apply to scenario-primary skills.
- [x] Consolidation survivors enriched (issue #42 execution): `node-database-read-replicas`, `node-transactional-outbox`, `node-api-deprecation`, `node-migrations`, `node-skill-packaging`, `node-skill-pack-installation`, `node-skill-pack-manifest-governance` — each absorbed the retired scaffolds' distinctive guidance at the band depth baseline.
- [x] 6× cluster enriched (band 6): `node-external-integrations`, `node-typescript-contracts`, `node-architecture`, `node-llm-observability` — their decision tables were already band-grade; each gained the boundary-with-related-skills section and a compact load-bearing reference example (classified outbound-call wrapper with deadline, idempotency, and trace propagation; schema-derived types + discriminated union + branded IDs + exhaustive `never` switch; port/adapter/composition-root wiring; GenAI semconv span carrying token and cost attributes).
- The remaining ~295 skills are ~2 KB scaffolds. Continue enriching in routing-case-frequency order. `node-testing` (251 references) and `node-observability` (203) lead the raw counts because they are universal secondaries (listed in nearly every routing case); resolved as the infrastructure tier (see above). Keep each skill under 500 lines; move deep knowledge into skill-local `references/` one level deep.

## Cross-pack pinning

- [x] `cross_pack.companions` pins `react-agent-skills` to the immutable tag **`v0.1.0`** (the companion's first tagged release, cut at `eb7758f` after RELEASE.md-gated verification); the snapshot records the tagged commit.
- [x] ruby-agent-skills pin evaluated and bumped **`v1.5.0` → `v1.6.0`** (2026-11-24): inventory unchanged between the two tags (104 skills, zero `node-`-prefixed, collision intersection still empty); snapshot refreshed to the tagged commit `ad6701a` (the MCP-ecosystem release — its `mcp/permissions.yml` companion profiles are the reason to pin this tag rather than stay on v1.5.0). The v3 verifier passes with the refreshed snapshot.
- [x] First immutable tag automation: the Release workflow now cuts the `v<version>` tag + GitHub Release exactly when a Release PR merges (headline-gated, idempotent) — companions can pin this pack on an immutable tag from the next release onward.

## Scheduled recheck

- [x] react-agent-skills merged its production-readiness branch (squashed `6868b6a` via PR #23, then enrichment PRs #24/#25): `bin/cross-pack-verify.mjs --companions ..` passes with the node-to-react-client seam symmetric on both sides (`react-agent-skills/skills/react-node-integration`), and the companion snapshot tracks post-enrichment react main (`5f96069`; inventory unchanged by enrichment). Resolved by the immutable-tag pin (see "Cross-pack pinning"): the verifier now runs against `v0.1.0` and the snapshot records the tagged commit (`eb7758f`).
