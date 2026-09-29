# Wave 11 — runtime, data, security, and lifecycle

Adds 20 framework-neutral skills and two adapters.

## Core coverage

- Node Permission Model and async/request context propagation
- cancellation, worker threads, safe child processes
- HTTP body limits, upload security, SSRF defense
- cache-key and tenant-cache isolation
- database index/query performance, lock contention, connection leaks, transaction retries
- health checks, startup readiness, config drift detection, generated-code governance

## Adapters

- Hapi 21.x.x
- Mercurius current

## Verification

- npm test
- npm run validate
