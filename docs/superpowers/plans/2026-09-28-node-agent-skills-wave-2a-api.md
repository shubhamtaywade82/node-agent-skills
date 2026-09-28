# Node Agent Skills Wave 2A API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-grade HTTP/API skills and framework adapters for Express, Fastify, NestJS, and Hono without coupling the framework-neutral core to any framework.

**Architecture:** Keep protocol/API invariants in `skills/`; put framework-specific lifecycle, middleware, routing, error handling, and adapter mechanics under `adapters/<framework>/`. Every new skill is introduced with a failing routing/evaluation test before its skill body is added. Framework guidance is version-scoped and backed by official documentation.

**Tech Stack:** Node.js 24+ repository baseline, TypeScript, HTTP, REST/OpenAPI, GraphQL, WebSockets, webhooks; Express, Fastify, NestJS, Hono adapters.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md` plus approved Wave 2 design.

## Global Constraints

- Core skills remain framework-neutral.
- Every skill description begins with `Use when`.
- Runtime validation is required at untrusted boundaries; TypeScript types alone are insufficient.
- Authentication and authorization remain separate concerns.
- Retries require an explicit idempotency/safety decision.
- Every skill stays below 500 lines.
- Adapter guidance must identify the supported framework/version scope.
- Do not weaken validators/evaluations to make CI pass.

## Review Focus

- Malformed/unexpected request payloads must be rejected or normalized at the runtime boundary.
- Authentication without authorization must never be treated as sufficient.
- Retries on non-idempotent mutations must be explicitly prevented or guarded.
- API pagination/filtering must have deterministic semantics and bounded resource usage.
- Webhook processing must verify authenticity before side effects and tolerate duplicate delivery.

### Task 1: HTTP foundation

**Files:**
- Create: `skills/node-http-engineering/SKILL.md`
- Create: `skills/node-api-versioning/SKILL.md`
- Test: `test/skill_contract.test.mjs`, `evals/cases/api/http.yml`

**Interfaces:**
- Produces routing triggers and invariants for all later API skills.

- [ ] Write failing tests for skill manifest entries, frontmatter, required sections, and pressure cases.
- [ ] Run `npm test` and confirm the new cases fail.
- [ ] Add the two skills with request lifecycle, error mapping, lifecycle ownership, API compatibility, deprecation, and versioning guidance.
- [ ] Run targeted tests, then `npm test && npm run validate`.
- [ ] Commit `feat: add HTTP and API versioning skills`.

### Task 2: REST, pagination, idempotency

**Files:**
- Create: `skills/node-rest-api-design/SKILL.md`
- Create: `skills/node-pagination-filtering/SKILL.md`
- Create: `skills/node-idempotency/SKILL.md`
- Test: `evals/cases/api/rest.yml`, `evals/cases/api/idempotency.yml`

**Interfaces:**
- Consumes Task 1 HTTP invariants.
- Produces reusable REST and mutation-safety rules for webhook, queue, and integration skills.

- [ ] Write failing pressure cases for ambiguous status codes, unstable offset pagination, and unsafe mutation retries.
- [ ] Verify failure.
- [ ] Add skills covering resource modeling, error envelopes, cursor/offset tradeoffs, filtering limits, idempotency keys, deduplication, and replay semantics.
- [ ] Run the full repository validator and tests.
- [ ] Commit `feat: add REST pagination and idempotency skills`.

### Task 3: OpenAPI, GraphQL, WebSockets

**Files:**
- Create: `skills/node-openapi/SKILL.md`
- Create: `skills/node-graphql/SKILL.md`
- Create: `skills/node-websockets/SKILL.md`
- Test: `evals/cases/api/protocols.yml`

**Interfaces:**
- Produces protocol-specific contracts without changing core architecture guidance.

- [ ] Write failing protocol pressure cases for schema drift, GraphQL resolver authorization, and unbounded WebSocket resources.
- [ ] Verify failure.
- [ ] Add skills covering schema-first/contract-first OpenAPI, GraphQL resolver/data-loader/security boundaries, and WebSocket lifecycle/backpressure/reconnect semantics.
- [ ] Run tests and validator.
- [ ] Commit `feat: add API protocol skills`.

### Task 4: Webhooks

**Files:**
- Create: `skills/node-webhooks/SKILL.md`
- Test: `evals/cases/api/webhooks.yml`

**Interfaces:**
- Consumes `node-runtime-validation`, `node-idempotency`, and external integration invariants.

- [ ] Write failing cases for signature verification ordering, timestamp/replay checks, duplicate events, and provider timeout behavior.
- [ ] Verify failure.
- [ ] Add the webhook skill with raw-body requirements, signature verification, replay protection, idempotent side effects, and acknowledgement strategy.
- [ ] Run tests and validator.
- [ ] Commit `feat: add webhook engineering skill`.

### Task 5: Framework adapters

**Files:**
- Create: `adapters/express/README.md`, `adapters/fastify/README.md`, `adapters/nestjs/README.md`, `adapters/hono/README.md`
- Create: `adapters/<framework>/SKILL.md`
- Modify: `router/ROUTING.md`, `skill-manifest.yml`
- Test: `test/routing_cases.test.mjs`, `evals/cases/api/frameworks.yml`

**Interfaces:**
- Adapter skills consume the framework-neutral API skills and only add framework-specific translation rules.

- [ ] Add failing routing cases that select an adapter only when the repository/framework is actually detected.
- [ ] Verify failure.
- [ ] Add adapter skills for routing, middleware/hooks/guards, error handling, request context, testing, shutdown, and framework-specific pitfalls.
- [ ] Add official documentation references and explicit version scope.
- [ ] Run `npm test && npm run validate`.
- [ ] Commit `feat: add Node HTTP framework adapters`.

### Task 6: API routing/evaluation integration

**Files:**
- Modify: `router/ROUTING_CASES.yml`, `evals/cases/core-boundaries.yml`, `README.md`
- Test: `test/routing_cases.test.mjs`

- [ ] Add mixed scenarios where framework adapter selection and core API skill selection must both occur.
- [ ] Verify no existing core routing regression.
- [ ] Update README with API capability matrix.
- [ ] Run all tests and validator.
- [ ] Commit `docs: document Wave 2A API routing`.

## Completion Gate

Wave 2A is complete only when every new skill has a test/evaluation case, manifest/router validation passes, all framework adapters are version-scoped, and CI reports success on the PR.
