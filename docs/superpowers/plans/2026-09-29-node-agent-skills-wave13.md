# Wave 13 — distribution, codegen, database-runtime, and TypeScript/package diagnostics

> Retrospective plan. The work was delivered on 2026-09-29.

**Goal:** Add skills for code generation/distribution (codegen-engineering, generated-code-review, generated-client-governance, generated-schema-contracts, generated-artifact-determinism), database-runtime (read-replica-routing, index-engineering, advisory-locks, cardinality-control, deadlock-diagnostics, isolation-level-selection, query-plan-engineering, postgres-locking), and TypeScript/package (typescript-config-engineering, tsconfig-project-references, typescript-declaration-publishing, typescript-module-resolution, dual-package-hazards, package-exports, package-imports, subpath-patterns, package-self-reference, esm-cjs-interoperability, package-manager-policy, package-tooling, lockfile-integrity, postinstall-safety, install-script-safety, dependency-confusion-defense).

**Architecture:** Codegen skills own the "machine writes code" boundary. Database-runtime skills own the SQL execution boundary. TypeScript/package skills own the module-resolution boundary.

**Tech Stack:** Node.js 24+, TypeScript, code generation (OpenAPI → client, schema → types), PostgreSQL runtime diagnostics, package exports, tsconfig project references.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- No skill exceeds 500 lines.

## Review Focus

- Codegen: deterministic outputs; no machine-specific paths; reproducible builds.
- Generated code review: same standard as hand-written code; tested.
- Read-replica routing: staleness budget; no replica for write-after-read.
- Index engineering: measure with EXPLAIN ANALYZE before adding.
- Advisory locks: fencing token; TTL; release in finally.
- Cardinality control: low-cardinality labels only; no user_id.
- Deadlock diagnostics: capture lock graph; fix cycle, not the symptom.
- Isolation levels: Read Committed default; Serializable only when needed.
- TypeScript config: strict, noUncheckedIndexedAccess for libraries.
- Package exports: explicit `exports` field; no internal path leaks.
- Dual-package hazards: no both-ESM-and-CJS-emit; pick one.

## Tasks

### Task 1: Codegen
- Created `skills/node-codegen-engineering/SKILL.md`, `skills/node-generated-code-review/SKILL.md`, `skills/node-generated-client-governance/SKILL.md`, `skills/node-generated-schema-contracts/SKILL.md`, `skills/node-generated-artifact-determinism/SKILL.md`.

### Task 2: Database runtime
- Created `skills/node-database-read-replica-routing/SKILL.md`, `skills/node-index-engineering/SKILL.md`, `skills/node-database-advisory-locks/SKILL.md`, `skills/node-cardinality-control/SKILL.md`, `skills/node-deadlock-diagnostics/SKILL.md`, `skills/node-isolation-level-selection/SKILL.md`, `skills/node-query-plan-engineering/SKILL.md`, `skills/node-postgres-locking/SKILL.md`.

### Task 3: TypeScript config + module resolution
- Created `skills/node-typescript-config-engineering/SKILL.md`, `skills/node-tsconfig-project-references/SKILL.md`, `skills/node-typescript-declaration-publishing/SKILL.md`, `skills/node-typescript-module-resolution/SKILL.md`.

### Task 4: Package + supply chain
- Created `skills/node-package-exports/SKILL.md`, `skills/node-package-imports/SKILL.md`, `skills/node-subpath-patterns/SKILL.md`, `skills/node-package-self-reference/SKILL.md`, `skills/node-esm-cjs-interoperability/SKILL.md`, `skills/node-dual-package-hazards/SKILL.md`, `skills/node-package-manager-policy/SKILL.md`, `skills/node-package-tooling/SKILL.md`, `skills/node-lockfile-integrity/SKILL.md`, `skills/node-postinstall-safety/SKILL.md`, `skills/node-install-script-safety/SKILL.md`, `skills/node-dependency-confusion-defense/SKILL.md`.

### Task 5: Routing + evaluation coverage
- Added routing cases in `router/ROUTING_CASES.yml`.
- Added 24 evaluation cases in `evals/cases/distribution-codegen-database-runtime/workflow.yml`.
- Added 24 evaluation cases in `evals/cases/typescript-packages-diagnostics/workflow.yml`.
- Added `test/wave13_contract.test.mjs`, `test/wave13_routing_evaluation_contract.test.mjs`, `test/wave13_routing_coverage_contract.test.mjs`.

## Completion gate

- `npm test` ✓
- `npm run validate` ✓
- Routing/evaluation coverage ✓
