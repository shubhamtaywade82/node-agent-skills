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
- Architecture and runtime foundations
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

### Framework adapters
| Framework | Guide | Supported major |
|---|---|---|
| Express | adapters/express/SKILL.md | 5.x |
| Fastify | adapters/fastify/SKILL.md | 5.x |
| NestJS | adapters/nestjs/SKILL.md | 12.x |
| Hono | adapters/hono/SKILL.md | 4.x |

Adapters are conditional. Agents must detect the framework and installed version from the target repository before applying adapter-specific guidance.

## Architecture
`skills/` contains framework-neutral routed knowledge units. `skill-manifest.yml` is the registry and includes version-scoped adapter metadata. `router/` defines ownership and adapter selection. `scripts/validate.mjs` checks consistency. `test/` protects repository contracts. `evals/` contains behavioral pressure scenarios.

## Agent routing model
1. Inspect the repository and dependency manifests.
2. Select the dominant backend boundary.
3. Load the owning core skill.
4. Load only the secondary skills required by actual dependencies.
5. Detect framework/version and load the adapter only when applicable.
6. Verify with tests, contract checks, and the repository validator.

## Quality principles
- Runtime truth is separate from TypeScript compile-time types.
- Untrusted input is validated at the boundary.
- Authentication is not authorization.
- Retries require an explicit idempotency decision.
- At-least-once delivery is assumed for queues/webhooks unless the infrastructure contract proves otherwise.
- Critical integrity belongs in database constraints/transactions.
- Resilience mechanisms need explicit budgets and observability.
- Evaluations are measurement infrastructure and must not be weakened to obtain green CI.

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

CI workflow is validated on GitHub Actions for the Wave 2A branch.
