# Routing

Route by the dominant backend boundary first. Framework adapters are a translation layer selected only after repository inspection detects the concrete framework.

| Boundary | Primary | Secondary |
|---|---|---|
| architecture | node-architecture | node-typescript-contracts |
| design pattern/refactoring | node-design-patterns | node-architecture, node-typescript-contracts, node-testing |
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
| PostgreSQL | node-postgresql-persistence | node-database-engineering, node-transactions, node-testing |
| database transactions | node-transactions | node-database-engineering, node-testing |
| schema migration | node-migrations | node-database-engineering, node-production-runtime |
| connection pooling | node-connection-pooling | node-postgresql-persistence, node-performance |
| Redis | node-redis | node-caching, node-async-concurrency |
| caching | node-caching | node-redis, node-performance |
| background jobs | node-queues | node-background-jobs-reliability, node-async-concurrency |
| message broker | node-message-brokers | node-background-jobs-reliability, node-observability |
| outbox | node-outbox | node-transactional-outbox, node-transactions |
| transactional outbox | node-transactional-outbox | node-transactions, node-message-brokers |
| jobs/queues | node-background-jobs-reliability | node-async-concurrency, node-observability |
| telemetry | node-observability | node-production-runtime |
| tests | node-testing | domain-owning skill |
| performance | node-performance | node-observability |
| production | node-production-runtime | node-observability |
| external service | node-external-integrations | node-runtime-validation, node-idempotency |
| retries/deadlines | node-retry-timeouts | node-idempotency, node-resilience |
| resilience policy | node-resilience | node-retry-timeouts, node-observability |
| circuit breaker | node-circuit-breakers | node-retry-timeouts, node-resilience |
| capacity isolation | node-bulkheads | node-load-shedding, node-backpressure |
| overload | node-load-shedding | node-rate-limiting, node-backpressure |
| backpressure | node-backpressure | node-async-concurrency, node-load-shedding |
| rate limiting | node-rate-limiting | node-auth-security, node-redis |
| distributed system | node-distributed-systems | node-idempotency, node-observability |
| distributed lock | node-distributed-locks | node-database-engineering, node-redis |
| event-driven architecture | node-event-driven-architecture | node-message-brokers, node-transactional-outbox |
| zero downtime | node-zero-downtime | node-production-runtime, node-database-migrations-production |
| production DB migration | node-database-migrations-production | node-migrations, node-zero-downtime |
| incident response | node-incident-engineering | node-observability, node-runtime-diagnostics |
| runtime diagnosis | node-runtime-diagnostics | node-performance, node-observability |
| release engineering | node-release-engineering | node-zero-downtime, node-database-migrations-production |

| repository discovery | node-repository-forensics | node-architecture, node-module-boundaries |
| debugging/incident diagnosis | node-debugging | node-observability, node-runtime-diagnostics |
| backend code review | node-code-review | node-security-hardening, node-testing |
| safe refactoring | node-refactoring | node-design-patterns, node-testing |
| dependency upgrade | node-dependency-upgrades | node-supply-chain, node-build-engineering |
| monorepo/workspaces | node-monorepo-engineering | node-module-boundaries, node-build-engineering |
| CLI/operational command | node-cli-engineering | node-runtime-foundations, node-observability |
| streams/large I/O | node-streams | node-backpressure, node-async-concurrency |
| SSE/realtime HTTP | node-server-sent-events | node-streams, node-auth-security |
| object storage | node-object-storage | node-file-uploads, node-external-integrations |
| email delivery | node-email-delivery | node-queues, node-external-integrations |
| search/indexing | node-search-engineering | node-database-engineering, node-multi-tenancy |
| cryptography | node-cryptography | node-secrets, node-security-hardening |
| agent evaluation | node-agent-evaluation | node-testing, node-code-review |
| documentation | node-documentation-engineering | node-repository-forensics, node-release-engineering |
| developer experience | node-developer-experience | node-package-tooling, node-build-engineering |
| CloudEvents | node-cloud-events | node-event-driven-architecture, node-schema-evolution |
| saga/workflow orchestration | node-saga-orchestration | node-distributed-systems, node-transactional-outbox |

| gRPC/RPC | node-grpc | node-rpc-contracts, node-deadline-timeouts if present |
| RPC contract | node-rpc-contracts | node-schema-evolution, node-testing |
| API gateway/proxy | node-api-gateway | node-rate-limiting, node-retry-timeouts, node-auth-security |
| service mesh | node-service-mesh | node-zero-downtime, node-production-runtime, node-retry-timeouts |
| message delivery semantics | node-message-delivery | node-message-brokers, node-idempotency |
| schema registry | node-schema-registry | node-schema-evolution, node-event-driven-architecture |
| consumer rebalance | node-consumer-rebalancing | node-message-delivery, node-background-jobs-reliability |
| authorization model | node-authorization-models | node-auth-security, node-multi-tenancy |
| threat modeling | node-threat-modeling | node-security-hardening, node-auth-security |
| secure coding | node-secure-coding | node-security-hardening, node-runtime-validation |
| legacy modernization | node-legacy-modernization | node-dependency-upgrades, node-refactoring |
| change impact analysis | node-change-impact-analysis | node-repository-forensics, node-module-boundaries |
| migration planning | node-migration-assistant | node-dependency-upgrades, node-database-migrations-production |
| ADR | node-architecture-decision-records | node-architecture, node-documentation-engineering |
| test data | node-test-data-management | node-testing, node-integration-testing |
| flaky tests | node-flaky-test-engineering | node-testing, node-test-environment-engineering |
| test environment | node-test-environment-engineering | node-testcontainers, node-integration-testing |
| API deprecation | node-api-deprecation | node-api-versioning, node-openapi |

| CQRS | node-cqrs | node-domain-modeling, node-read-models |
| read models | node-read-models | node-event-driven-architecture, node-schema-evolution |
| event sourcing | node-event-sourcing | node-event-driven-architecture, node-schema-evolution |
| optimistic concurrency | node-optimistic-concurrency | node-transactions, node-idempotency |
| data reconciliation | node-data-reconciliation | node-distributed-systems, node-database-engineering |
| batch processing | node-batch-processing | node-backpressure, node-queues |
| data import/export | node-data-import-export | node-runtime-validation, node-object-storage |
| database read replicas | node-database-read-replicas | node-postgresql-persistence, node-connection-pooling |
| database sharding | node-database-sharding | node-database-engineering, node-transactions |
| data archival | node-data-archival | node-data-privacy, node-object-storage |
| durable workflows | node-durable-workflows | node-saga-orchestration, node-queues |
| outbound webhooks | node-outbound-webhooks | node-webhooks, node-idempotency |
| agent task decomposition | node-task-decomposition | node-repository-forensics, node-implementation-planning |
| agent context engineering | node-context-engineering | node-repository-forensics, node-runtime-validation |
| implementation planning | node-implementation-planning | node-change-impact-analysis, node-testing |
| patch validation | node-patch-validation | node-code-review, node-validation-triage |
| merge conflict resolution | node-merge-conflict-resolution | node-patch-validation, node-code-review |
| validation triage | node-validation-triage | node-debugging, node-patch-validation |
| review feedback | node-review-feedback | node-code-review, node-patch-validation |

| disaster recovery | node-disaster-recovery | node-backup-restore, node-production-runtime |
| backup and restore | node-backup-restore | node-disaster-recovery, node-data-archival |
| chaos engineering | node-chaos-engineering | node-resilience, node-incident-engineering |
| capacity planning | node-capacity-planning | node-performance, node-load-testing |
| cost-aware engineering | node-cost-aware-engineering | node-capacity-planning, node-performance |
| multi-region | node-multi-region | node-disaster-recovery, node-failover-engineering |
| failover engineering | node-failover-engineering | node-multi-region, node-distributed-locks |
| graceful degradation | node-graceful-degradation | node-resilience, node-circuit-breakers |
| time engineering | node-time-engineering | node-runtime-foundations, node-scheduling |
| session management | node-session-management | node-auth-security, node-cookie-security |
| cookie security | node-cookie-security | node-session-management, node-csrf if present |
| CORS security | node-cors-security | node-auth-security, node-http-engineering |
| security headers | node-security-headers | node-auth-security, node-http-engineering |
| CI pipeline | node-ci-pipeline-engineering | node-build-engineering, node-testing |
| progressive delivery | node-progressive-delivery | node-release-engineering, node-feature-flags |
| infrastructure as code | node-infrastructure-as-code | node-kubernetes, node-release-engineering |
| observability validation | node-observability-validation | node-observability, node-incident-engineering |
| runbook engineering | node-runbook-engineering | node-incident-engineering, node-documentation-engineering |

| SLI/SLO engineering | node-sli-slo-engineering | node-observability, node-performance |
| error budgets | node-error-budget-engineering | node-sli-slo-engineering, node-release-engineering |
| service ownership | node-service-ownership | node-documentation-engineering, node-incident-engineering |
| on-call readiness | node-oncall-readiness | node-observability, node-runbook-engineering |
| operational readiness | node-operational-readiness | node-release-engineering, node-disaster-recovery |
| security incident response | node-security-incident-response | node-secrets, node-incident-engineering |
| vulnerability management | node-vulnerability-management | node-supply-chain, node-dependency-upgrades |
| session revocation | node-auth-session-revocation | node-auth-security, node-session-management |
| OAuth client security | node-oauth-client-security | node-auth-security, node-secrets |
| OIDC integration | node-oidc-integration | node-oauth-client-security, node-auth-security |
| MFA | node-mfa-engineering | node-auth-security, node-session-management |
| password storage | node-password-storage | node-auth-security, node-cryptography |
| user enumeration defense | node-user-enumeration-defense | node-auth-security, node-rate-limiting |
| Node native test runner | node-native-test-runner | node-testing, node-test-isolation-engineering |
| HTTP integration testing | node-http-testing | node-integration-testing, node-testing |
| benchmarking | node-benchmark-engineering | node-performance, node-observability |
| failure injection testing | node-failure-injection-testing | node-resilience, node-chaos-engineering |
| test isolation | node-test-isolation-engineering | node-testing, node-test-environment-engineering |

## Framework adapter selection

After selecting the core owner, detect the actual framework from dependency manifests/imports before loading an adapter:

| Detected framework | Adapter | Scope |
|---|---|---|
| Express | adapters/express/SKILL.md | Express 5.x |
| Fastify | adapters/fastify/SKILL.md | Fastify 5.x |
| NestJS | adapters/nestjs/SKILL.md | NestJS 12.x; verify exact package versions |
| Hono | adapters/hono/SKILL.md | Hono 4.x; verify exact package version |
| Prisma | adapters/prisma/SKILL.md | Prisma 7.x/8.x; verify exact major |
| Drizzle | adapters/drizzle/SKILL.md | Current/v1; verify exact package versions |
| BullMQ | adapters/bullmq/SKILL.md | BullMQ 5.x/6.x; verify exact major |
| node-redis | adapters/redis/SKILL.md | node-redis 5.x; verify exact version |
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

Do not select an adapter merely because the user says "Node API". Core skills are always applicable; adapters are conditional.

## Selection rules
1. Inspect the repository first.
2. Pick one primary owner for the dominant backend boundary.
3. Add secondary skills only for real dependent constraints.
4. Load a framework adapter only after detecting the framework/version from repository dependencies.
5. Authentication and authorization remain distinct.
6. Prefer framework-neutral skills before vendor/framework adapters.

| domain modeling | node-domain-modeling | node-architecture, node-transactions |
| hexagonal architecture | node-hexagonal-architecture | node-domain-modeling, node-dependency-injection |
| dependency injection | node-dependency-injection | node-module-boundaries, node-architecture |
| module boundaries | node-module-boundaries | node-architecture, node-design-patterns |
| integration testing | node-integration-testing | node-testing, node-testcontainers |
| end-to-end testing | node-e2e-testing | node-integration-testing, node-testing |
| testcontainers | node-testcontainers | node-integration-testing, node-database-engineering |
| load testing | node-load-testing | node-performance, node-observability |
| API clients | node-api-client-engineering | node-external-integrations, node-retry-timeouts |
| file uploads | node-file-uploads | node-runtime-validation, node-security-hardening |
| scheduling | node-scheduling | node-queues, node-idempotency |
| multi-tenancy | node-multi-tenancy | node-auth-security, node-database-engineering |
| audit logging | node-audit-logging | node-observability, node-auth-security |
| data privacy | node-data-privacy | node-secrets, node-observability, node-audit-logging |
