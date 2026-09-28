# Node Agent Skills Wave 2B Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add database, cache, queue, broker, and transactional messaging skills plus Prisma, Drizzle, BullMQ, and Redis adapters.

**Architecture:** Core persistence/reliability rules remain vendor-neutral. Adapters explain how the same invariants map to concrete libraries and are version-scoped. Critical correctness is expressed through constraints, transactions, idempotency, and replay-safe processing rather than framework conventions.

**Tech Stack:** PostgreSQL, Redis, Prisma, Drizzle, BullMQ; message-broker concepts are vendor-neutral with Kafka adapter guidance where justified.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md` plus approved Wave 2 design.

## Global Constraints

- Never use an ORM abstraction to hide critical integrity requirements.
- Transactions must have explicit ownership and bounded lifetime.
- External network calls do not belong inside database transactions unless the integration explicitly requires a documented pattern.
- Queue consumers are assumed at-least-once unless proven otherwise.
- Cache correctness must define stale, missing, invalidated, and backend-unavailable states.
- New skills begin with failing tests.
- Version-specific adapter guidance must be isolated from framework-neutral rules.

## Review Focus

- Concurrent writers must be protected by database constraints/locking where required.
- Migration changes must be deployable without breaking old application versions.
- Duplicate jobs/events must not duplicate side effects.
- Redis outage behavior must be explicit rather than silently becoming a correctness dependency.
- Cache invalidation races must not corrupt source-of-truth data.

### Task 1: Database and transaction foundations

**Files:** `skills/node-database-engineering/SKILL.md`, `skills/node-transactions/SKILL.md`, `skills/node-connection-pooling/SKILL.md`, matching tests/evals.

- [ ] Write failing pressure tests for constraint ownership, transaction boundaries, and pool exhaustion.
- [ ] Verify failure.
- [ ] Add the three skills.
- [ ] Run tests/validator.
- [ ] Commit `feat: add database transaction skills`.

### Task 2: Migrations

**Files:** `skills/node-migrations/SKILL.md`, matching tests/evals.

- [ ] Add failing cases for destructive migrations, long locks, expand/contract sequencing, and rollback assumptions.
- [ ] Verify failure.
- [ ] Add production migration guidance.
- [ ] Run tests/validator.
- [ ] Commit `feat: add database migration skill`.

### Task 3: Redis and caching

**Files:** `skills/node-redis/SKILL.md`, `skills/node-caching/SKILL.md`, matching tests/evals.

- [ ] Add failing cases for TTL semantics, stampedes, stale data, invalidation races, and Redis outages.
- [ ] Verify failure.
- [ ] Add Redis operational guidance and cache-aside/write-through/write-behind tradeoffs.
- [ ] Run tests/validator.
- [ ] Commit `feat: add Redis and caching skills`.

### Task 4: Queues and brokers

**Files:** `skills/node-queues/SKILL.md`, `skills/node-message-brokers/SKILL.md`, matching tests/evals.

- [ ] Add failing cases for duplicate delivery, visibility/lease expiry, poison messages, retries, and ordering assumptions.
- [ ] Verify failure.
- [ ] Add queue/broker semantics, consumer ownership, dead-lettering, retry, ordering, and replay guidance.
- [ ] Run tests/validator.
- [ ] Commit `feat: add queue and broker skills`.

### Task 5: Outbox and transactional messaging

**Files:** `skills/node-outbox/SKILL.md`, `skills/node-transactional-outbox/SKILL.md`, matching tests/evals.

- [ ] Add failing cases for atomic DB+event publication and relay duplication.
- [ ] Verify failure.
- [ ] Add outbox schema, relay, claiming, idempotency, cleanup, and replay guidance.
- [ ] Run tests/validator.
- [ ] Commit `feat: add transactional outbox skills`.

### Task 6: Prisma/Drizzle/BullMQ/Redis adapters

**Files:** `adapters/prisma/*`, `adapters/drizzle/*`, `adapters/bullmq/*`, `adapters/redis/*`, manifest/router/evals.

- [ ] Add failing routing cases for each adapter and version detection.
- [ ] Verify failure.
- [ ] Add adapter guidance using official documentation and explicit version scope.
- [ ] Keep Prisma 8-specific behavior out of the core skill because Prisma 7 remains supported.
- [ ] Run all tests/validator.
- [ ] Commit `feat: add persistence and queue adapters`.

### Task 7: Infrastructure routing integration

- [ ] Add mixed ORM/queue/cache scenarios to routing tests.
- [ ] Verify existing core routing remains unchanged.
- [ ] Document infrastructure capability matrix.
- [ ] Run `npm test && npm run validate`.
- [ ] Commit `docs: document Wave 2B infrastructure routing`.

## Completion Gate

Wave 2B is complete only when every infrastructure skill has a regression/pressure case, adapters are version-scoped, replay/idempotency behavior is explicit, and PR CI succeeds.
