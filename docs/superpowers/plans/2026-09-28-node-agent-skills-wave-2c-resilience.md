# Node Agent Skills Wave 2C Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add distributed-systems and production-resilience skills covering retries, timeouts, circuit breakers, bulkheads, load shedding, backpressure, rate limits, distributed locks, zero-downtime operations, and incident engineering.

**Architecture:** Treat resilience mechanisms as coordinated policies rather than isolated middleware. Each mechanism has explicit failure semantics, budgets, observability, and ownership. Skills must distinguish local process guarantees from distributed guarantees.

**Tech Stack:** Node.js runtime primitives, HTTP clients, Redis/coordination concepts, PostgreSQL, containers/Kubernetes, OpenTelemetry.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md` plus approved Wave 2 design.

## Global Constraints

- Timeouts/deadlines are explicit and propagate through call graphs.
- Retry policy includes eligibility, attempt budget, backoff, jitter, and cancellation.
- Circuit breakers do not replace timeouts or idempotency.
- Concurrency is bounded before adding parallelism.
- Rate limiting must define identity, scope, storage, and failure behavior.
- Distributed locks require ownership, lease expiry, fencing/epoch strategy where stale owners could cause corruption.
- Production rollout guidance must preserve compatibility during mixed-version deployment.

## Review Focus

- Retries must not amplify load during dependency failure.
- Timeout values must not leave orphaned work or unbounded promises.
- Circuit breakers must not hide persistent dependency failure.
- Rate limits must remain coherent across multiple instances.
- Distributed lock expiry must not allow stale workers to mutate protected state.
- Backpressure/load shedding must preserve high-priority traffic and bounded memory.

### Task 1: Retry, timeout, resilience primitives

**Files:** `skills/node-retry-timeouts/SKILL.md`, `skills/node-resilience/SKILL.md`, matching tests/evals.

- [ ] Write failing cases for non-idempotent retries, deadline propagation, retry storms, and cancellation.
- [ ] Verify failure.
- [ ] Add the skills with explicit policy tables and examples.
- [ ] Run tests/validator.
- [ ] Commit `feat: add retry and resilience skills`.

### Task 2: Circuit breakers, bulkheads, load shedding

**Files:** `skills/node-circuit-breakers/SKILL.md`, `skills/node-bulkheads/SKILL.md`, `skills/node-load-shedding/SKILL.md`, matching tests/evals.

- [ ] Add failing pressure cases for open/half-open breaker behavior, pool isolation, and overload rejection.
- [ ] Verify failure.
- [ ] Add skills with state models, capacity budgets, admission control, and observability requirements.
- [ ] Run tests/validator.
- [ ] Commit `feat: add overload resilience skills`.

### Task 3: Backpressure and rate limiting

**Files:** `skills/node-backpressure/SKILL.md`, `skills/node-rate-limiting/SKILL.md`, matching tests/evals.

- [ ] Add failing cases for unbounded queues, stream pressure, per-tenant limits, distributed counters, and fail-open/closed decisions.
- [ ] Verify failure.
- [ ] Add skills.
- [ ] Run tests/validator.
- [ ] Commit `feat: add backpressure and rate limiting skills`.

### Task 4: Distributed coordination and event-driven architecture

**Files:** `skills/node-distributed-systems/SKILL.md`, `skills/node-distributed-locks/SKILL.md`, `skills/node-event-driven-architecture/SKILL.md`, matching tests/evals.

- [ ] Add failing cases for split-brain assumptions, stale lock owners, duplicate events, ordering, and consumer replay.
- [ ] Verify failure.
- [ ] Add skills with explicit consistency/failure models and coordination constraints.
- [ ] Run tests/validator.
- [ ] Commit `feat: add distributed systems skills`.

### Task 5: Zero-downtime and production operations

**Files:** `skills/node-zero-downtime/SKILL.md`, `skills/node-database-migrations-production/SKILL.md`, `skills/node-incident-engineering/SKILL.md`, `skills/node-runtime-diagnostics/SKILL.md`, `skills/node-release-engineering/SKILL.md`, matching tests/evals.

- [ ] Add failing cases for mixed-version compatibility, shutdown deadlines, rollback/roll-forward decisions, and incident evidence collection.
- [ ] Verify failure.
- [ ] Add production rollout, diagnostics, incident, and release guidance.
- [ ] Run tests/validator.
- [ ] Commit `feat: add production operations skills`.

### Task 6: Cross-wave adversarial evaluation

**Files:** `evals/cases/reliability/*`, `evals/cases/security/*`, `router/ROUTING_CASES.yml`, tests.

- [ ] Add adversarial scenarios combining retries + idempotency, queue delivery + outbox, rate limits + multi-instance deployment, and shutdown + in-flight work.
- [ ] Verify cases fail before corresponding guidance exists.
- [ ] Run complete evaluation suite.
- [ ] Fix only actual routing/skill defects; never weaken cases.
- [ ] Commit `test: add Wave 2 resilience evaluations`.

### Task 7: Wave 2 quality gate

- [ ] Run repository tests and validator.
- [ ] Verify manifest/router/skill counts agree.
- [ ] Verify all new skills remain below 500 lines.
- [ ] Verify every adapter has version scope and official documentation references.
- [ ] Open PR targeting `main`.
- [ ] Wait for GitHub Actions and resolve failures before declaring ready.

## Completion Gate

Wave 2C is complete only when cross-wave adversarial cases pass, all new skills are routed deterministically, and PR CI is green.
