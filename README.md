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

### Ecosystem and agent-workflow wave
- Repository forensics, debugging, code review, refactoring, and dependency lifecycle
- Monorepo/workspace engineering, operational CLIs, streams, and Server-Sent Events
- Object storage, email delivery, search, and application cryptography
- Agent evaluation, backend documentation, and developer experience
- CloudEvents and saga orchestration

### Advanced services and agent-engineering wave
- gRPC/RPC contracts, API gateways, service-mesh interaction, and message-delivery semantics
- Schema registries and consumer rebalancing
- Authorization models, threat modeling, and secure coding
- Legacy modernization, impact analysis, migration planning, and ADRs
- Test-data, flaky-test, and test-environment engineering
- API deprecation lifecycle

### Data architecture and agent execution wave
- CQRS, read models, event sourcing, optimistic concurrency, reconciliation
- Batch processing, import/export, replicas, sharding, archival, durable workflows
- Outbound webhooks
- Task decomposition, context engineering, implementation planning, patch validation
- Merge-conflict resolution, validation triage, review-feedback integration

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
| pg | adapters/pg/SKILL.md | current node-postgres |
| undici | adapters/undici/SKILL.md | current undici |
| zod | adapters/zod/SKILL.md | 4.x |
| valibot | adapters/valibot/SKILL.md | current |
| typebox | adapters/typebox/SKILL.md | current |
| kafkajs | adapters/kafkajs/SKILL.md | 2.x |
| aws-sdk-v3 | adapters/aws-sdk-v3/SKILL.md | v3 |
| pino | adapters/pino/SKILL.md | current |
| prometheus | adapters/prometheus/SKILL.md | current @prometheus-io/client |
| pnpm | adapters/pnpm/SKILL.md | current |
| turborepo | adapters/turborepo/SKILL.md | current |
| nx | adapters/nx/SKILL.md | current |
| grpc-js | adapters/grpc-js/SKILL.md | current @grpc/grpc-js |
| protobufjs | adapters/protobufjs/SKILL.md | current protobufjs |
| amqplib | adapters/amqplib/SKILL.md | current amqplib |
| nats | adapters/nats/SKILL.md | current NATS.js |
| aws-sqs | adapters/aws-sqs/SKILL.md | AWS SDK JavaScript v3 |
| aws-sns | adapters/aws-sns/SKILL.md | AWS SDK JavaScript v3 |
| aws-dynamodb | adapters/aws-dynamodb/SKILL.md | AWS SDK JavaScript v3 |
| opensearch | adapters/opensearch/SKILL.md | current @opensearch-project/opensearch |
| elasticsearch | adapters/elasticsearch/SKILL.md | current @elastic/elasticsearch |
| azure-sdk | adapters/azure-sdk/SKILL.md | current Azure SDK for JavaScript |
| google-cloud | adapters/google-cloud/SKILL.md | current Google Cloud Node.js client libraries |
| mongodb | adapters/mongodb/SKILL.md | 7.x |
| mongoose | adapters/mongoose/SKILL.md | 8.x |
| typeorm | adapters/typeorm/SKILL.md | 0.3.x/current |
| sequelize | adapters/sequelize/SKILL.md | 6.x stable |
| mysql2 | adapters/mysql2/SKILL.md | current 3.x |
| ioredis | adapters/ioredis/SKILL.md | 6.x |
| temporal | adapters/temporal/SKILL.md | 1.24.x/current |
| aws-eventbridge | adapters/aws-eventbridge/SKILL.md | AWS SDK JS v3 |
| azure-storage-blob | adapters/azure-storage-blob/SKILL.md | current @azure/storage-blob |
| google-cloud-storage | adapters/google-cloud-storage/SKILL.md | current @google-cloud/storage |
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
- https://node-postgres.com/features/pooling
- https://undici.nodejs.org/
- https://zod.dev/packages/zod
- https://valibot.dev/guides/quick-start/
- https://kafka.js.org/docs/getting-started
- https://docs.aws.amazon.com/sdk-for-javascript/
- https://pnpm.io/workspaces
- https://nx.dev/docs/features
- https://grpc.io/docs/languages/node/basics/
- https://github.com/protobufjs/protobuf.js/
- https://www.rabbitmq.com/tutorials/tutorial-one-javascript
- https://docs.nats.io/using-nats/developer/connecting
- https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_sqs_code_examples.html
- https://docs.opensearch.org/latest/clients/javascript/
- https://www.elastic.co/docs/reference/elasticsearch/clients/javascript
- https://learn.microsoft.com/en-us/azure/developer/javascript/
- https://docs.cloud.google.com/nodejs/docs/reference

CI workflow is validated on GitHub Actions for the current capability branch.
