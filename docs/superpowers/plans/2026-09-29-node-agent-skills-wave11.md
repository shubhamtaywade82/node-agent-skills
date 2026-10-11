# Wave 11 — runtime, data, security, and lifecycle

> Retrospective plan. The work was delivered on 2026-09-29.

**Goal:** Add skills covering Node permission model, async/request context, cancellation, workers, safe child processes, HTTP body limits, secure uploads, SSRF defense, cache-key and tenant-cache isolation, database indexes, query performance, lock contention, connection-leak detection, transaction retry, health checks, startup readiness, configuration-drift detection, and generated-code governance.

**Architecture:** Runtime skills own the Node process boundary. Data skills own the persistence boundary. Security skills own the untrusted-input boundary.

**Tech Stack:** Node.js 24+, TypeScript, Node permission model (process.permission), AsyncLocalStorage, worker_threads, AbortController, SSRF defense, advisory locks.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- No skill exceeds 500 lines.

## Review Focus

- Permission model: deny by default; allowlist fs.read/write/spawn.
- Async context: AsyncLocalStorage for request context; no module-level mutable state.
- Cancellation: AbortSignal propagated end-to-end; resources released.
- Worker threads: bound pool; terminate on parent shutdown.
- SSRF: egress allowlist; DNS resolved at request time.
- Cache-key isolation: per-tenant namespace; no cross-tenant leakage.
- Connection leak: pool idle returns to zero after request; alert on growth.
- Transaction retry: only on serialization/deadlock; explicit backoff.

## Tasks

### Task 1: Runtime + workers
- Created `skills/node-permission-model/SKILL.md`, `skills/node-request-context/SKILL.md`, `skills/node-async-context-propagation/SKILL.md`, `skills/node-abort-cancellation/SKILL.md`, `skills/node-worker-threads/SKILL.md`, `skills/node-child-process-safety/SKILL.md`.

### Task 2: HTTP body + uploads + SSRF + cache
- Created `skills/node-http-body-limits/SKILL.md`, `skills/node-file-uploads/SKILL.md`, `skills/node-upload-security/SKILL.md`, `skills/node-ssrf-defense/SKILL.md`, `skills/node-cache-key-security/SKILL.md`, `skills/node-tenant-cache-isolation/SKILL.md`.

### Task 3: Database
- Created `skills/node-database-index-engineering/SKILL.md`, `skills/node-query-performance/SKILL.md`, `skills/node-lock-contention/SKILL.md`, `skills/node-connection-leak-detection/SKILL.md`, `skills/node-transaction-retry/SKILL.md`.

### Task 4: Runtime ops + governance
- Created `skills/node-health-check-engineering/SKILL.md`, `skills/node-startup-readiness/SKILL.md`, `skills/node-config-drift-detection/SKILL.md`, `skills/node-generated-code-governance/SKILL.md`.

### Task 5: Wave 11 adapters
- Reconciled adapters: `fastify-swagger`, `fastify-multipart`, `nestjs-swagger`, `opentelemetry-sdk-node`.
- Each adapter: `SKILL.md` + `README.md` + version_scope + source URL.

### Task 6: Routing + evaluation coverage
- Added 18 routing cases in `router/ROUTING_CASES.yml`.
- Added 18 evaluation cases in `evals/cases/runtime-http-auth-observability/workflow.yml`.
- Added `test/wave11_contract.test.mjs`.

## Completion gate

- `npm test` ✓
- `npm run validate` ✓
- Routing/evaluation coverage ✓
