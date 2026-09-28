# Framework adapters

Framework adapters translate the framework-neutral skills in `skills/` into concrete framework lifecycle mechanics.

## Selection
Detect the framework and installed version from the target repository before loading an adapter.

| Adapter | Scope | Primary sources |
|---|---|---|
| Express | 5.x | https://expressjs.com/en/guide/migrating-5/ |
| Fastify | 5.x | https://fastify.dev/docs/latest/Reference/Lifecycle/ |
| NestJS | 12.x | https://docs.nestjs.com/migration-guide |
| Hono | 4.x | https://hono.dev/docs/guides/middleware |

Core contracts remain in `skills/`; adapter guidance must not become an alternative architecture layer.
