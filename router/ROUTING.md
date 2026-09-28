# Routing

Route by the dominant backend boundary first. Framework adapters are a translation layer selected only after repository inspection detects the concrete framework.

| Boundary | Primary | Secondary |
|---|---|---|
| architecture | node-architecture | node-typescript-contracts |
| runtime/lifecycle | node-runtime-foundations | node-production-runtime |
| async/concurrency | node-async-concurrency | node-observability |
| TypeScript contracts | node-typescript-contracts | node-runtime-validation |
| untrusted input | node-runtime-validation | node-testing |
| HTTP/API | node-http-engineering | node-runtime-validation, node-auth-security, node-rest-api-design |
| REST resource design | node-rest-api-design | node-http-engineering, node-api-versioning |
| API versioning | node-api-versioning | node-openapi, node-rest-api-design |
| pagination/filtering | node-pagination-filtering | node-postgresql-persistence, node-api-engineering |
| idempotent mutation | node-idempotency | node-background-jobs-reliability, node-external-integrations |
| OpenAPI | node-openapi | node-api-versioning, node-runtime-validation |
| GraphQL | node-graphql | node-auth-security, node-runtime-validation |
| WebSocket/realtime | node-websockets | node-async-concurrency, node-observability |
| webhooks | node-webhooks | node-idempotency, node-external-integrations |
| security | node-auth-security | node-runtime-validation, node-testing |
| PostgreSQL | node-postgresql-persistence | node-testing |
| jobs/queues | node-background-jobs-reliability | node-async-concurrency, node-observability |
| telemetry | node-observability | node-production-runtime |
| tests | node-testing | domain-owning skill |
| performance | node-performance | node-observability |
| production | node-production-runtime | node-observability |
| external service | node-external-integrations | node-runtime-validation, node-idempotency |

## Framework adapter selection

After selecting the core owner, detect the actual framework from dependency manifests/imports before loading an adapter:

| Detected framework | Adapter | Scope |
|---|---|---|
| Express | adapters/express/SKILL.md | Express 5.x |
| Fastify | adapters/fastify/SKILL.md | Fastify 5.x |
| NestJS | adapters/nestjs/SKILL.md | NestJS 12.x; verify exact package versions |
| Hono | adapters/hono/SKILL.md | Hono 4.x; verify exact package version |

Do not select an adapter merely because the user says "Node API". Core skills are always applicable; adapters are conditional.

## Selection rules
1. Inspect the repository first.
2. Pick one primary owner for the dominant backend boundary.
3. Add secondary skills only for real dependent constraints.
4. Load a framework adapter only after detecting the framework/version from repository dependencies.
5. Authentication and authorization remain distinct.
6. Prefer framework-neutral skills before vendor/framework adapters.
