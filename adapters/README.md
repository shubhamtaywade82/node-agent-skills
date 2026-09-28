# Framework and infrastructure adapters

Adapters translate framework- or library-specific mechanics onto the framework-neutral contracts in `skills/`.

## Selection
Detect the exact package versions in the target repository before loading an adapter.

| Adapter | Scope | Primary source |
|---|---|---|
| Express | 5.x | https://expressjs.com/en/guide/migrating-5/ |
| Fastify | 5.x | https://fastify.dev/docs/latest/Reference/Lifecycle/ |
| NestJS | 12.x | https://docs.nestjs.com/migration-guide |
| Hono | 4.x | https://hono.dev/docs/guides/middleware |
| Prisma | 7.x/8.x | https://www.prisma.io/docs/orm/release-status |
| Drizzle | current/v1 transition | https://orm.drizzle.team/docs/migrations |
| BullMQ | 5.x/6.x | https://docs.bullmq.io/guide/queues/ |
| node-redis | 5.x | https://redis.io/docs/latest/develop/clients/nodejs/ |

Core skills remain the owner of architecture and correctness invariants. Adapters should only translate those invariants into framework/library-specific lifecycle and API mechanics.
