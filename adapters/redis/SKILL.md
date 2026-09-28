---
name: redis
description: Use when a Node.js backend uses Redis or node-redis for caching, transactions, pipelines, Pub/Sub, client-side caching, or ephemeral coordination.
---

# Redis Adapter

## Purpose
Map framework-neutral Redis guidance onto the official node-redis client while making server/client version and failure semantics explicit.

## Activate when
Detect the redis package and verify the installed node-redis version. Inspect the Redis server version and deployment topology before using feature-specific capabilities.

## Repository inspection
Find createClient configuration, socket/reconnection settings, TLS, RESP version, transactions/pipelines, client-side caching, Pub/Sub usage, key namespaces, TTL policy, and shutdown.

## Decision rules
- node-redis is the recommended Node.js Redis client in the official Redis documentation.
- Connect explicitly and close clients with the documented lifecycle.
- node-redis reconnects automatically by default with exponential backoff and jitter; customize only when application failure budgets require it.
- Use Redis transactions for atomic command groups; pipelines are primarily a round-trip optimization.
- Client-side caching requires RESP3 and has explicit server/client compatibility requirements; do not enable it by copying a sample without checking versions.
- Keep cache, Pub/Sub, and blocking/coordination connection lifecycles separate when the use case requires dedicated connection behavior.

## Implementation procedure
1. Detect node-redis and Redis server versions.
2. Define connection/reconnect behavior.
3. Define key namespaces and TTLs.
4. Select transaction, pipeline, Pub/Sub, or client-side caching semantics deliberately.
5. Instrument connection state and command failures.
6. Close all clients during shutdown.

## Failure modes
- node-redis version-specific features are assumed from memory.
- Reconnect policy creates a synchronized client storm.
- Pipeline semantics are mistaken for transactional semantics.
- Client-side cache configuration exceeds supported versions.
- Shared client lifecycle causes Pub/Sub or blocking operations to interfere with ordinary commands.

## Verification
Test startup outage, reconnect, TLS/auth, transaction behavior, pipeline behavior, TTL, Pub/Sub lifecycle, and shutdown.

## Sources
- https://redis.io/docs/latest/develop/clients/nodejs/
- https://redis.io/docs/latest/develop/clients/nodejs/connect/
- https://redis.io/docs/latest/develop/clients/nodejs/transpipe/
