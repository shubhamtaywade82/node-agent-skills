# Wave 8 — operations, delivery, and security

> Retrospective plan. The work was delivered on 2026-09-29.

**Goal:** Add operations/delivery/security skills: disaster recovery, backup/restore, chaos experiments, capacity/cost engineering, multi-region/failover design, graceful degradation, deterministic time handling, session/cookie/CORS/browser security headers, CI pipeline engineering, progressive delivery, infrastructure as code, observability validation, executable runbooks.

**Architecture:** Operations skills own the runtime delivery boundary. Security skills own the browser-trust boundary. Both are framework-neutral.

**Tech Stack:** Node.js 24+, TypeScript, chaos engineering, capacity planning, IaC (Terraform, Helm, ArgoCD), CI/CD (GitHub Actions), observability validation.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- Existing validators and routing contracts remain authoritative.
- No skill exceeds 500 lines.

## Review Focus

- DR: RTO and RPO are explicit numbers; tested via failover drills.
- Chaos: experiments are bounded; can abort; metrics captured during.
- Capacity: per-tenant budgets; alerts on burn.
- Multi-region: data residency; replication lag.
- Time handling: monotonic for measurement, wall-clock for display.
- CORS: origins are an allowlist, not a wildcard.
- CI: gates fail closed; no skipped checks.

## Tasks

### Task 1: DR + backup + chaos + capacity + cost
- Created `skills/node-disaster-recovery/SKILL.md`, `skills/node-backup-restore/SKILL.md`, `skills/node-chaos-engineering/SKILL.md`, `skills/node-capacity-planning/SKILL.md`, `skills/node-cost-aware-engineering/SKILL.md`.

### Task 2: Multi-region + failover + degradation + time
- Created `skills/node-multi-region/SKILL.md`, `skills/node-failover-engineering/SKILL.md`, `skills/node-graceful-degradation/SKILL.md`, `skills/node-time-engineering/SKILL.md`.

### Task 3: Browser security
- Created `skills/node-session-management/SKILL.md`, `skills/node-cookie-security/SKILL.md`, `skills/node-cors-security/SKILL.md`, `skills/node-security-headers/SKILL.md`.

### Task 4: CI + delivery + IaC + runbooks
- Created `skills/node-ci-pipeline-engineering/SKILL.md`, `skills/node-progressive-delivery/SKILL.md`, `skills/node-infrastructure-as-code/SKILL.md`, `skills/node-observability-validation/SKILL.md`, `skills/node-runbook-engineering/SKILL.md`.

### Task 5: Wave 8 adapters
- Created adapters: `npm`, `docker`, `kubernetes`, `opentelemetry`, `vitest`, `jest`, `node-test-runner`, `supertest`, `playwright`, `testcontainers`.
- Each adapter: `SKILL.md` + `README.md` + version_scope + source URL.

### Task 6: Routing + evaluation coverage
- Added 18 routing cases in `router/ROUTING_CASES.yml`.
- Added 18 evaluation cases in `evals/cases/operations-delivery-security/workflow.yml`.
- Added `test/wave8_contract.test.mjs`.

## Completion gate

- `npm test` ✓
- `npm run validate` ✓
- Routing/evaluation coverage ✓
