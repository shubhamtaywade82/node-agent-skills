# Wave 6 — advanced services and agent-engineering

> Retrospective plan. The work was delivered on 2026-09-29. This plan documents what was scoped, the constraints, the review focus, the tasks executed, and the completion gate.

**Goal:** Add advanced service-to-service integration skills (gRPC, API gateways, service mesh, message-delivery semantics), schema-registry governance, consumer rebalancing, authorization models, threat modeling, secure coding, legacy modernization, impact analysis, migration planning, ADRs, test-data/flaky-test/test-environment engineering, and API deprecation lifecycle.

**Architecture:** Core skills remain framework-neutral. Each advanced-service skill is a routing boundary with its own primary case. Adapters layer on top after version detection.

**Tech Stack:** Node.js 24+, TypeScript, gRPC, protobufjs, OpenAPI, OAuth/OIDC, schema registries, ADRs, threat modeling, test-data factories.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- Existing validators and routing contracts remain authoritative.
- No skill exceeds 500 lines.

## Review Focus

- gRPC contract drift between server and client.
- Message-delivery semantics: exactly-once requires proof, not assumption.
- Schema-registry compatibility: forward + backward.
- Authorization models: RBAC vs ABAC vs ACLs; pick one and stay consistent.
- Threat modeling: assets, attack surfaces, trust boundaries.
- Test data: factories + sanitization; no PII in fixtures.

## Tasks

### Task 1: RPC + gateway + mesh + delivery
- Created `skills/node-grpc/SKILL.md`, `skills/node-rpc-contracts/SKILL.md`, `skills/node-api-gateway/SKILL.md`, `skills/node-service-mesh/SKILL.md`, `skills/node-message-delivery/SKILL.md`.

### Task 2: Schema + consumer + authz + threat
- Created `skills/node-schema-registry/SKILL.md`, `skills/node-consumer-rebalancing/SKILL.md`, `skills/node-authorization-models/SKILL.md`, `skills/node-threat-modeling/SKILL.md`, `skills/node-secure-coding/SKILL.md`.

### Task 3: Legacy + impact + migration + ADRs
- Created `skills/node-legacy-modernization/SKILL.md`, `skills/node-change-impact-analysis/SKILL.md`, `skills/node-migration-assistant/SKILL.md`, `skills/node-architecture-decision-records/SKILL.md`.

### Task 4: Test-data + flaky + env + deprecation
- Created `skills/node-test-data-management/SKILL.md`, `skills/node-flaky-test-engineering/SKILL.md`, `skills/node-test-environment-engineering/SKILL.md`, `skills/node-api-deprecation/SKILL.md`.

### Task 5: Wave 6 adapters
- Created adapters: `grpc-js`, `protobufjs`, `apollo-server`, `graphql-yoga`, `mercurius`, `oauth4webapi`, `openid-client`, `jose`, `kysely`, `mongodb-memory-server`, `hapi`, `ajv`.
- Each adapter: `SKILL.md` + `README.md` + version_scope + source URL.

### Task 6: Routing + evaluation coverage
- Added 18 routing cases in `router/ROUTING_CASES.yml`.
- Added 18 evaluation cases in `evals/cases/advanced-services/workflow.yml`.
- Added `test/wave6_contract.test.mjs`.

## Completion gate

- `npm test` ✓
- `npm run validate` ✓
- Routing/evaluation coverage ✓
