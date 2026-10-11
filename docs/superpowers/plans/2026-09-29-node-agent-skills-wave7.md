# Wave 7 — data architecture and agent execution

> Retrospective plan. The work was delivered on 2026-09-29.

**Goal:** Add data-architecture skills (CQRS, read models, event sourcing, optimistic concurrency, reconciliation, batch processing, import/export, replicas, sharding, archival, durable workflows, outbound webhooks) and agent-execution skills (task decomposition, context engineering, implementation planning, patch validation, merge-conflict resolution, validation triage, review-feedback integration).

**Architecture:** Data skills own the persistence boundary. Agent-execution skills own the workflow boundary between the agent and the codebase. Both are framework-neutral.

**Tech Stack:** Node.js 24+, TypeScript, CQRS, event sourcing, sagas, durable workflows (Temporal), outbound webhooks.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- Existing validators and routing contracts remain authoritative.
- No skill exceeds 500 lines.

## Review Focus

- CQRS: command side and query side have separate contracts; do not collapse.
- Event sourcing: events are immutable; projections are derived.
- Optimistic concurrency: version field + compare-and-swap, not application-level locking.
- Durable workflows: state persists across process restarts.
- Outbound webhooks: at-least-once delivery with idempotency key.
- Task decomposition: each subtask has a clear contract and verification.

## Tasks

### Task 1: Data architecture (CQRS, read models, event sourcing)
- Created `skills/node-cqrs/SKILL.md`, `skills/node-read-models/SKILL.md`, `skills/node-event-sourcing/SKILL.md`, `skills/node-optimistic-concurrency/SKILL.md`, `skills/node-data-reconciliation/SKILL.md`.

### Task 2: Batch + import/export + replicas + sharding + archival
- Created `skills/node-batch-processing/SKILL.md`, `skills/node-data-import-export/SKILL.md`, `skills/node-database-read-replicas/SKILL.md`, `skills/node-database-sharding/SKILL.md`, `skills/node-data-archival/SKILL.md`.

### Task 3: Durable workflows + outbound webhooks
- Created `skills/node-durable-workflows/SKILL.md`, `skills/node-outbound-webhooks/SKILL.md`.

### Task 4: Agent execution (decomposition, context, planning, patch)
- Created `skills/node-task-decomposition/SKILL.md`, `skills/node-context-engineering/SKILL.md`, `skills/node-implementation-planning/SKILL.md`, `skills/node-patch-validation/SKILL.md`.

### Task 5: Merge + triage + review
- Created `skills/node-merge-conflict-resolution/SKILL.md`, `skills/node-validation-triage/SKILL.md`, `skills/node-review-feedback/SKILL.md`.

### Task 6: Wave 7 adapters
- Created adapters: `temporal`, `aws-eventbridge`, `azure-storage-blob`, `google-cloud-storage`, `mongodb`, `mongoose`, `typeorm`, `sequelize`, `mysql2`, `ioredis`.
- Each adapter: `SKILL.md` + `README.md` + version_scope + source URL.

### Task 7: Routing + evaluation coverage
- Added 19 routing cases in `router/ROUTING_CASES.yml`.
- Added 19 evaluation cases in `evals/cases/data-agent-execution/workflow.yml`.
- Added `test/wave7_contract.test.mjs`.

## Completion gate

- `npm test` ✓
- `npm run validate` ✓
- Routing/evaluation coverage ✓
