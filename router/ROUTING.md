# Routing

Route by the dominant backend boundary, not by framework name.

| Boundary | Primary | Secondary |
|---|---|---|
| architecture | node-architecture | node-typescript-contracts |
| design pattern/refactoring | node-design-patterns | node-architecture, node-typescript-contracts, node-testing |
| runtime/lifecycle | node-runtime-foundations | node-production-runtime |
| async/concurrency | node-async-concurrency | node-error-contracts |
| TypeScript contracts | node-typescript-contracts | node-runtime-validation |
| untrusted input | node-runtime-validation | node-error-contracts |
| HTTP/API | node-api-engineering | node-runtime-validation, node-auth-security |
| security | node-auth-security | node-runtime-validation, node-testing |
| PostgreSQL | node-postgresql-persistence | node-testing |
| jobs/queues | node-background-jobs-reliability | node-async-concurrency, node-observability |
| telemetry | node-observability | node-production-runtime |
| tests | node-testing | domain-owning skill |
| performance | node-performance | node-observability |
| production | node-production-runtime | node-observability |
| external service | node-external-integrations | node-runtime-validation, node-error-contracts |

## Selection rules

1. Inspect the repository first.
2. Pick one primary owner for the dominant boundary.
3. Add secondary skills only for real dependent constraints.
4. Authentication and authorization remain distinct.
5. Prefer core skills before vendor/framework adapters.
6. For design patterns, require a concrete code smell or change vector before introducing an abstraction.
7. Prefer TypeScript-native composition (functions, maps, discriminated unions) over pattern-shaped class hierarchies.
