# node-agent-skills

Production-grade **Node.js + TypeScript backend engineering skills for AI coding agents**.

The core is framework-neutral. The pack teaches agents to inspect first, identify the owning boundary, reason about runtime and type contracts, validate untrusted input, bound concurrency, enforce persistence integrity, secure APIs, test behavior, observe production systems, and operate services safely.

## Verify
```bash
npm test
npm run validate
```

## Capability inventory

### Core
- Architecture and runtime foundations, including pragmatic design patterns
- Async concurrency and TypeScript contracts
- Runtime validation and HTTP/API engineering
- Authentication/security
- PostgreSQL persistence
- Background jobs
- Observability
- Testing and performance
- Production runtime
- External integrations

### API wave
- HTTP lifecycle and transport errors
- REST resource design
- API versioning/deprecation
- Pagination/filtering
- Idempotent mutations
- OpenAPI contracts
- GraphQL
- WebSockets/realtime
- Webhooks

### Security, quality, and platform wave
- Configuration and secret boundaries
- Security hardening and supply-chain controls
- Package/build engineering
- Contract, property-based, and fuzz testing
- Schema evolution and feature flags
- Containers, Kubernetes, and serverless runtime patterns

### Infrastructure wave
- Database integrity and transaction boundaries
- Production migrations and connection-pool budgeting
- Redis and cache consistency
- Queues and worker reliability
- Durable message-broker consumption
- Outbox and transactional outbox patterns

### Framework and infrastructure adapters
| Adapter | Guide | Supported scope |
|---|---|---|
| Express | adapters/express/SKILL.md | 5.x |
| Fastify | adapters/fastify/SKILL.md | 5.x |
| NestJS | adapters/nestjs/SKILL.md | 12.x |
| Hono | adapters/hono/SKILL.md | 4.x |
| Prisma | adapters/prisma/SKILL.md | 7.x/8.x |
| Drizzle | adapters/drizzle/SKILL.md | current/v1 transition; verify exact versions |
| BullMQ | adapters/bullmq/SKILL.md | 5.x/6.x |
| node-redis | adapters/redis/SKILL.md | 5.x |
| npm | adapters/npm/SKILL.md | current CLI |
| Docker | adapters/docker/SKILL.md | current Docker/BuildKit |
| Kubernetes | adapters/kubernetes/SKILL.md | current API conventions |
| OpenTelemetry | adapters/opentelemetry/SKILL.md | current JS SDK |

Adapters are conditional. Agents must detect the framework/library and installed version from the target repository before applying adapter-specific guidance.

## Architecture
`skills/` contains framework-neutral routed knowledge units. `skill-manifest.yml` is the registry and includes version-scoped adapter metadata. `router/` defines ownership and adapter selection. `scripts/validate.mjs` checks consistency. `test/` protects repository contracts. `evals/` contains behavioral pressure scenarios.

## Agent routing model
1. Inspect the repository and dependency manifests.
2. Select the dominant backend boundary.
3. Load the owning core skill.
4. Load only the secondary skills required by actual dependencies.
5. Detect framework/version and load the adapter only when applicable.
6. Verify with tests, contract checks, and the repository validator.

## Infrastructure quality principles

- Database constraints own critical relational invariants.
- Transactions are short and have explicit ownership.
- Migrations are designed for mixed-version deployments.
- Connection pools are sized across the whole deployment, not one process.
- Redis/cache failure semantics are explicit.
- Queue and broker consumers assume replay/duplicate delivery unless the contract proves otherwise.
- Outbox publication is asynchronous and duplicate-safe.

## Quality principles
- Runtime truth is separate from TypeScript compile-time types.
- Untrusted input is validated at the boundary.
- Authentication is not authorization.
- Retries require an explicit idempotency decision.
- At-least-once delivery is assumed for queues/webhooks unless the infrastructure contract proves otherwise.
- Critical integrity belongs in database constraints/transactions.
- Resilience mechanisms need explicit budgets and observability.
- Evaluations are measurement infrastructure and must not be weakened to obtain green CI.
- Resilience controls are policy budgets, not generic middleware decorations.
- Configuration and secrets are explicit runtime boundaries.
- Dependency and artifact supply chains are treated as production inputs.
- Platform adapters are selected from detected runtime/tool versions, not assumed defaults.

## Sources
- https://nodejs.org/en/about/previous-releases
- https://spec.openapis.org/oas/v3.1.0
- https://graphql.org/learn/
- https://graphql.github.io/graphql-over-http/
- https://expressjs.com/en/guide/migrating-5/
- https://fastify.dev/docs/latest/Reference/Lifecycle/
- https://docs.nestjs.com/migration-guide
- https://hono.dev/docs/guides/middleware
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- https://vitest.dev/guide/
- https://jestjs.io/docs/getting-started
- https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/
- https://playwright.dev/docs/api-testing

CI workflow is validated on GitHub Actions for the current capability branch.
