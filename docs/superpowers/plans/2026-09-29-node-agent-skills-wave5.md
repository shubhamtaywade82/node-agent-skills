# Wave 5 — ecosystem and agent workflow

> Retrospective plan. The work was delivered on 2026-09-29. This plan documents what was scoped, the constraints, the review focus, the tasks executed, and the completion gate.

**Goal:** Close broad backend gaps outside framework-specific HTTP/database adapters: repository forensics, debugging, review, refactoring, dependency upgrades, monorepos, CLIs, streams/SSE, storage/email/search integrations, cryptography, agent evaluation, documentation/DX, CloudEvents, and saga orchestration.

**Architecture:** Core skills remain framework-neutral. Adapters layer on top after version detection. Every new skill gets a failing routing/evaluation test before its body is added.

**Tech Stack:** Node.js 24+, TypeScript, repository forensics (git), monorepo tooling (pnpm/turborepo/nx), CloudEvents 1.0, saga orchestration, cryptography, streams/SSE.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection before applying.
- A RED contract test gates registry/evaluation/adapter completeness.
- Existing validators and routing contracts remain authoritative.
- No skill exceeds 500 lines.

## Review Focus

- Repository forensics must distinguish facts from inference.
- Refactoring must preserve the observable contract; no behavior drift.
- Monorepo engineering must respect workspace boundaries.
- Streams must respect backpressure; no unbounded buffering.
- Saga orchestration must handle compensating actions explicitly.
- Documentation must reflect current behavior, not aspirational design.

## Tasks

### Task 1: Repository forensics + debugging + review skills
- Created `skills/node-repository-forensics/SKILL.md`, `skills/node-debugging/SKILL.md`, `skills/node-code-review/SKILL.md`, `skills/node-refactoring/SKILL.md`.
- Added evaluation cases in `evals/cases/ecosystem/workflow.yml`.

### Task 2: Monorepo + CLI + streams/SSE
- Created `skills/node-monorepo-engineering/SKILL.md`, `skills/node-cli-engineering/SKILL.md`, `skills/node-streams/SKILL.md`, `skills/node-server-sent-events/SKILL.md`.
- Added routing cases for each.

### Task 3: Object storage + email + search + cryptography
- Created `skills/node-object-storage/SKILL.md`, `skills/node-email-delivery/SKILL.md`, `skills/node-search-engineering/SKILL.md`, `skills/node-cryptography/SKILL.md`.

### Task 4: Agent evaluation + documentation + CloudEvents + saga
- Created `skills/node-agent-evaluation/SKILL.md`, `skills/node-documentation-engineering/SKILL.md`, `skills/node-developer-experience/SKILL.md`, `skills/node-cloud-events/SKILL.md`, `skills/node-saga-orchestration/SKILL.md`.

### Task 5: Ecosystem adapters
- Created adapters: `pg`, `undici`, `zod`, `valibot`, `typebox`, `kafkajs`, `aws-sdk-v3`, `pino`, `prometheus`, `pnpm`, `turborepo`, `nx`.
- Each adapter: `SKILL.md` + `README.md` + version_scope + source URL.

### Task 6: Routing + evaluation coverage
- Added 18 routing cases in `router/ROUTING_CASES.yml`.
- Added 18 evaluation cases in `evals/cases/ecosystem/workflow.yml`.
- Added `test/wave5_contract.test.mjs`.

## Completion gate

- `npm test` ✓ (Wave 5 contract test passes)
- `npm run validate` ✓ (manifest, adapters, and routing consistent)
- Routing/evaluation coverage ✓ (every new skill has a routing case + evaluation case)
