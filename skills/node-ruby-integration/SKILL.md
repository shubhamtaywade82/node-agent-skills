---
name: node-ruby-integration
description: Use when a Node.js backend (Express, Fastify, NestJS, Hono) talks to a Ruby/Rails service — choosing the integration mode (HTTP, JSON-RPC, shared Postgres, queue), generating or consuming the API contract, sending cookies and CSRF tokens cross-origin, mapping Rails 422 errors into a Node problem+json envelope, and propagating trace context across the language boundary.
---

# Node and Ruby Backend Integration

## Purpose

This skill owns the **Node-to-Ruby backend boundary** — the contract between a Node.js service and a sibling Rails backend. It does NOT own either side's internals: the `node-`-prefixed skills own the Node service's HTTP handler, validation, persistence, and observability; the `rails-`-prefixed skills in `ruby-agent-skills` own the Rails side. This skill owns only the seam between them: the contract, the credentials, the error envelope, and the cross-language routing.

This skill is the **symmetric mirror** of `ruby-agent-skills/skills/rails-node-integration`. Either side can take the lead; the other side is consulted as a secondary. When both packs are installed, load both. When only this pack is installed, do the work for the Node side and report the Rails-side follow-up with the companion skill that owns it.

## Activate when

- A Node service (Express, Fastify, NestJS, Hono) calls a Rails backend over HTTP, JSON-RPC, gRPC, or a queue.
- A Rails backend consumes Node JSON (a Node BFF proxying for a Rails API, or a Node service exposing an endpoint that Rails calls).
- A monorepo has both a Node service and a Rails app and a task touches both.
- A Sidekiq job is being replaced by a Node BullMQ worker (or vice versa) and the contract between the two must be preserved.
- Cross-origin credentials (cookies, CSRF tokens) need to flow from a Rails client through a Node BFF or vice versa.
- Rails `422` validation errors need to be mapped into a Node service's `application/problem+json` envelope (or vice versa).
- Observability (traces, logs, correlation IDs) needs to propagate across the Node/Rails boundary.

## Repository inspection

Before implementing a Node-Ruby change, inspect both sides:

- **Node side**: `package.json` (deps, scripts, type field for ESM/CJS), `tsconfig.json` (strict mode, module resolution), the framework adapter (`node_modules/express`, etc.), the route handlers, the validation library (`zod`/`valibot`/`@hono/zod-openapi`), the auth middleware, the persistence layer (Prisma/Drizzle/pg/Sequelize), `pnpm-workspace.yaml` or `turbo.json` if monorepo, the test runner (`node --test`, `vitest`, `jest`).
- **Rails side**: routes (`config/routes.rb`), controllers (`app/controllers/`), serializers (`app/serializers/`, or `Blueprinter`/`ActiveModelSerializers`/`Panko`), auth (`app/controllers/concerns/authentication.rb`, `config/initializers/devise.rb`), `config/database.yml`, `config/cable.yml`, `config/sidekiq.yml`, `Gemfile`, `Gemfile.lock`, `db/schema.rb`.
- **Shared contract**: is there a shared OpenAPI/JSON Schema? A shared TypeScript package generated from Rails routes (`railsroutes` gem, `oas` generator)? A `packages/contracts/` directory in a monorepo?

Resolve both versions: Node from `package.json` + `node -v`; Ruby/Rails from `Gemfile.lock` + `bundle exec rails -v` (or `bundle exec ruby -v` if Rails is not installed).

## Decision rules

- **This pack owns the Node side and the seam.** The seam is the contract: the request/response shapes, the credentials, the error envelope, the observability headers. The seam is NOT the Rails service's internal architecture.
- **Companion pack owns the Rails side.** For Rails Active Record models, Action Controller endpoints, validations, and authentication, defer to `ruby-agent-skills/skills/rails-node-integration` (the symmetric seam) and the `rails-`-prefixed skills it routes to.
- **Never copy a `rails-` skill into this pack.** Cross-pack work composes by loading both packs' skills, never by duplication. `AGENTS.md` (Companion packs section) prohibits copying.
- **Pick the integration mode first.** The four common modes:
  | Mode | When | Owner on Node side | Owner on Rails side |
  |---|---|---|---|
  | HTTP REST / JSON API | Rails is the API authority, Node is a client | `node-rest-api-design` + this skill | `rails-action-controller` + `rails-node-integration` (companion) |
  | JSON-RPC / gRPC | Tight, method-call-style contract | `node-rpc-contracts` + this skill | `rails-action-controller` (companion) + `rails-node-integration` (companion) |
  | Shared Postgres | Both sides read/write the same DB | `node-postgresql-persistence` + this skill | `rails-active-record` (companion) + `rails-node-integration` (companion) |
  | Queue (BullMQ ↔ Sidekiq) | Async cross-language work | `node-queue-engineering` + this skill | `rails-active-job` (companion) + `rails-node-integration` (companion) |
- **Credentials and CSRF are a seam concern.** Cross-origin cookies require `SameSite=None; Secure` on the Rails cookie, `credentials: 'include'` on Node fetch, and a CSRF strategy that works cross-origin (token endpoint, double-submit, or session-cookie + custom header). Both sides must agree.
- **Error envelope is a seam concern.** Rails renders `422` with `errors: {field: [...]}` (Active Model errors). Node services commonly render `application/problem+json` (RFC 9457) with `detail` and `errors[].field`. The mapping is bi-directional and owned here. A canonical Node-side mapper function:
  ```ts
  function railsErrorsToProblem(rails422: { errors: Record<string, string[]> }): Problem {
    return {
      type: 'https://example.com/errors/validation',
      status: 422,
      title: 'Validation failed',
      detail: 'One or more fields failed validation.',
      errors: Object.entries(rails422.errors).flatMap(([field, messages]) =>
        messages.map(message => ({ field, message }))
      ),
    };
  }
  ```
- **Observability headers are a seam concern.** Pick a correlation ID convention (`X-Request-ID`, W3C `traceparent`) and propagate it on every cross-language call. Both sides must log the ID. Node-side middleware:
  ```ts
  app.use((req, res, next) => {
    const id = req.header('X-Request-ID') ?? crypto.randomUUID();
    req.id = id;
    res.setHeader('X-Request-ID', id);
    next();
  });
  ```
- **Schema generation is a seam concern.** If Rails is the API authority, generate a contract (OpenAPI / JSON Schema / TypeScript types) and consume it from Node. Do not hand-type the contract on the Node side; it will drift. If Node is the API authority (less common), generate the contract from Node's Zod schema and consume it on the Rails side.

## Implementation procedure

1. **Classify the task**: which of the four integration modes? If unclear, the task is ambiguous — ask before implementing.
2. **Inspect both sides**: see Repository inspection above.
3. **Load the symmetric companion**: if `ruby-agent-skills` is installed, also load `ruby-agent-skills/skills/rails-node-integration`. If not installed, finish the Node side and report the Rails-side follow-up with `rails-node-integration` as the owning skill.
4. **Implement the seam on the Node side**: HTTP client (use `undici` or framework-native fetch with `credentials: 'include'`), Zod schema (consumed from the generated contract), error mapper (Rails 422 → problem+json), observability middleware.
5. **Cross-link the contract**: if Rails is the API authority, generate the contract on the Rails side and consume it on the Node side. The Node service's `npm run build` should fail if the contract is missing or stale.
6. **Verify on both sides**: run Node tests for the HTTP client, error mapper, and observability middleware; run Rails tests for the controller/serializer. If only one side's tests exist, that is the verification surface; document the gap.
7. **Document the contract**: write a seam contract in this pack's `examples/` (new in v3; create `examples/rails-node-backend-seam/`) or in the consuming repo's `docs/integration/`. Reference it from `router/ROUTING.md`'s "Node and Ruby cross-stack routing" section.

## Failure modes

- **Hand-typing the Rails API contract in the Node service.** Drift is guaranteed. Generate the contract from Rails and consume it via Zod. The build should fail if the contract is stale.
- **Letting Rails serialize errors as `422` ad-hoc JSON when the Node consumer expects `application/problem+json`.** Pick one envelope and render it on both sides. The Node side can map Rails errors to problem+json in a single client-side mapper function (see Decision rules above).
- **Cross-origin cookies without `credentials: 'include'` on Node fetch AND `SameSite=None; Secure` on the Rails cookie.** The cookie is silently dropped; auth fails mysteriously.
- **CSRF token endpoint not exposed to the Node BFF.** The BFF cannot forward the CSRF token; mutating requests fail with `ActionController::InvalidAuthenticityToken`.
- **Correlation ID set on the Node side but not propagated by Rails.** Traces are broken across the boundary. Or vice versa.
- **Shared Postgres without an explicit write-authority table.** Both sides write the same row; lost updates. Pick one side as the write authority for each table; the other side reads only.
- **Loading this skill for a pure Node task with no Rails involvement.** This skill is the seam only; pure Node work routes to `node-rest-api-design` / `node-postgresql-persistence` / etc.
- **Loading this skill for a pure Rails task with no Node involvement.** Pure Rails work routes to `rails-`-prefixed skills in `ruby-agent-skills`; this skill is not the primary.

## Verification

- The Node HTTP client honors the contract types (test: integration test that mocks the Rails endpoint, posts a payload, and asserts the typed response).
- The Node consumer's build fails if the Rails-generated contract is missing or stale (test: `npm run build` after a contract regeneration).
- Cross-origin credentials round-trip (test: a Node integration test that calls a Rails endpoint with `credentials: 'include'` and asserts the cookie is sent).
- Error envelope is consistent across the boundary (test: assert a Rails 422 response and the Node-side `railsErrorsToProblem` mapper produce the same shape).
- Correlation ID propagates (test: Node-side middleware sets `X-Request-ID`; Rails integration test logs the same ID).
- Run `npm test && npm run validate` from this pack. If `ruby-agent-skills` is also installed locally, run `ruby bin/skill-pack-verify --root .` from the ruby pack.

## Composing with ruby-agent-skills

### When both packs are installed

| Concern on the seam | Primary | Secondary |
|---|---|---|
| Choosing the integration mode | `node-ruby-integration` (this skill) | `rails-node-integration` (companion) |
| Node HTTP handler | `node-rest-api-design` | `node-ruby-integration` |
| Node Active Record equivalent (Prisma/Drizzle) | `node-postgresql-persistence` | `node-ruby-integration` |
| Node auth + cross-origin credentials | `node-authentication` | `node-ruby-integration`; `rails-authentication` (companion) |
| Rails controller action | `rails-action-controller` (companion) | `rails-node-integration` (companion) |
| Rails Active Record model shared with Node | `rails-active-record` (companion) | `node-postgresql-persistence` |

### When only this pack is installed

Do the Node side and the seam. Report the Rails-side follow-up with the owning companion skill (`rails-node-integration` for the seam, `rails-action-controller` for the endpoint, `rails-active-record` for the model). Do not improvise Rails guidance from this pack.

## Sources

- RFC 9457 (Problem Details for HTTP APIs) — the canonical error envelope.
- RFC 9110 (HTTP Semantics) — `SameSite`, `credentials: 'include'`, `Vary`.
- W3C Trace Context (`traceparent` header) — the cross-language correlation ID standard.
- Zod documentation (https://zod.dev) — the canonical TypeScript schema library.
- This pack's `data/cross-pack/ruby-agent-skills.snapshot.yml` (v3 addition) — the pinned companion snapshot.
- The companion pack's `docs/CROSS_PACK_SCHEMA.md` — the shared v3 schema.
