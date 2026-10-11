# Wave 10 — data, API, messaging, and platform safety

> Retrospective plan. The work was delivered on 2026-09-29.

**Goal:** Add 18 framework-neutral skills and four adapters covering API compatibility and contract migration, batch/bulk operations, data retention/lineage/quality/masking/encryption/key management, message ordering/deduplication/poison-message handling/DLQs, boundary schema validation, runtime type safety, and Node package-resolution diagnostics.

**Architecture:** Each skill is a routing boundary. The data-safety cluster (retention, lineage, quality, masking, encryption, key management) is sequenced — masking depends on lineage, encryption depends on key management.

**Tech Stack:** Node.js 24+, TypeScript, data masking, encryption at rest (AES-GCM, KMS), message deduplication, package resolution diagnostics.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- Existing validators and routing contracts remain authoritative.
- No skill exceeds 500 lines.

## Review Focus

- API compatibility: backward and forward; semver enforced at the boundary.
- Batch/bulk: bounded batch size; idempotent retry; per-tenant rate.
- Data retention: explicit per-class policy; deletion is audited.
- Data lineage: provenance tracked end-to-end.
- Data masking: deterministic for join keys, randomized for free text.
- Encryption at rest: KMS-managed keys; envelope encryption.
- Message ordering: per-partition; deduplication via stable key.
- Package resolution: ESM/CJS interop; subpath imports; dual-package hazards.

## Tasks

### Task 1: API compatibility + batch + lifecycle
- Created `skills/node-api-compatibility/SKILL.md`, `skills/node-api-contract-migration/SKILL.md`, `skills/node-batch-api-design/SKILL.md`, `skills/node-bulk-operations/SKILL.md`.

### Task 2: Data lifecycle
- Created `skills/node-data-retention/SKILL.md`, `skills/node-data-lineage/SKILL.md`, `skills/node-data-quality/SKILL.md`, `skills/node-data-masking/SKILL.md`, `skills/node-encryption-at-rest/SKILL.md`, `skills/node-key-management/SKILL.md`.

### Task 3: Messaging
- Created `skills/node-message-ordering/SKILL.md`, `skills/node-message-deduplication/SKILL.md`, `skills/node-consumer-poison-message/SKILL.md`, `skills/node-dead-letter-queues/SKILL.md`.

### Task 4: Boundary + package
- Created `skills/node-schema-validation-at-boundary/SKILL.md`, `skills/node-runtime-type-safety/SKILL.md`, `skills/node-module-resolution-diagnostics/SKILL.md`, `skills/node-package-resolution/SKILL.md`.

### Task 5: Wave 10 adapters
- Created adapters: `bullmq`, `redis`, `prisma`, `drizzle`, `graphql-request`, `typescript`.
- Each adapter: `SKILL.md` + `README.md` + version_scope + source URL.

### Task 6: Routing + evaluation coverage
- Added 18 routing cases in `router/ROUTING_CASES.yml`.
- Added 18 evaluation cases in `evals/cases/runtime-data-security/workflow.yml`.
- Added `test/wave10_contract.test.mjs`.

## Completion gate

- `npm test` ✓
- `npm run validate` ✓
- Routing/evaluation coverage ✓
