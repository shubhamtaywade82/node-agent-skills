---
name: node-redis
description: Use when using Redis from Node.js for caching, ephemeral state, coordination, queues, streams, or transactional command execution through the node-redis client.
---

# node-redis

## Purpose
Treat Redis as a network dependency with explicit connection, retry, timeout, durability, and consistency semantics.

## Activate when
- Adding the redis Node.js client.
- Using Redis commands, transactions, pipelines, Pub/Sub, or client-side caching.
- Diagnosing reconnect storms or Redis outages.

## Repository inspection
Detect node-redis version, Redis server version, connection options, retry strategy, command timeouts, TLS, client topology, key prefixing, and shutdown behavior.

## Decision rules
| Concern | Rule |
|---|---|
| Client lifecycle | Create a bounded number of long-lived clients and close them during shutdown. |
| Failures | Decide per use case whether Redis failure is fail-open, fail-closed, or degraded. |
| Transactions | Use Redis transactions when atomic command grouping is required; pipelines primarily reduce round trips. |
| Keys | Scope keys explicitly by tenant/domain and define TTL/retention. |
| Reconnect | Bound reconnect behavior and avoid synchronized retry storms. |
| Durability | Do not treat ephemeral Redis state as authoritative unless durability is explicitly part of the design. |

## Implementation procedure
1. Verify the installed node-redis and server versions.
2. Establish connection and error telemetry.
3. Define key format, TTL, and failure behavior before adding commands.
4. Separate cache, Pub/Sub, and coordination client lifecycles where required.
5. Use transactions and pipelines according to their actual semantics.
6. Close clients during process drain.

## Failure modes
- Redis outage becomes a hidden correctness dependency.
- Cache keys cross tenants.
- Dedicated Pub/Sub connection semantics are ignored.
- Reconnect settings create a thundering herd.
- TTL is assumed when keys have no expiration.

## Verification
Test startup with Redis unavailable, reconnect during work, command timeout, shutdown, transaction atomicity, and key isolation.

## Sources
- https://redis.io/docs/latest/develop/clients/nodejs/
- https://redis.io/docs/latest/develop/clients/nodejs/transpipe/
