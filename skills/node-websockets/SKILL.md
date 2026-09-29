---
name: node-websockets
description: Use when implementing WebSocket or realtime server features involving connection lifecycle, authentication, reconnects, fan-out, heartbeats, or slow consumers.
---

# WebSockets

## Purpose
Treat each socket as a long-lived resource with explicit ownership, authorization, lifecycle, and bounded buffers.

## Activate when
- Adding WebSocket endpoints, realtime notifications, subscriptions, or bidirectional protocols.
- Handling reconnects, heartbeats, fan-out, or slow clients.
- Diagnosing leaked connections, memory growth, duplicate subscriptions, or stale sessions.

## Repository inspection
Inspect upgrade/authentication flow, connection registry, heartbeat/idle policy, shutdown behavior, message validation, fan-out mechanism, per-client buffers, and reconnect semantics.

## Decision rules
| Concern | Rule |
|---|---|
| Authentication | Authenticate the connection before subscribing it to protected data. |
| Authorization | Re-check authorization for actions/data whose permission can change during the connection lifetime. |
| Validation | Validate every inbound message at runtime. |
| Lifecycle | Define open, authenticated, idle, closing, closed, and server-drain states. |
| Backpressure | Every outbound path needs bounded buffering or a documented drop/disconnect policy. |
| Fan-out | Bound work per event and avoid synchronous work across all sockets. |
| Heartbeats | Use explicit liveness/dead-peer detection appropriate to the protocol/runtime. |
| Shutdown | Stop accepting new work, drain bounded outbound work, then close connections before the deadline. |

## Implementation procedure
1. Define the socket protocol and message schemas.
2. Establish connection identity and authorization context.
3. Validate inbound events before dispatch.
4. Register subscriptions with explicit cleanup.
5. Bound outbound queues and fan-out concurrency.
6. Make reconnect behavior safe against duplicate subscriptions.
7. Add close, error, slow-consumer, and shutdown tests.

## Failure modes
- A browser reconnect creates duplicate listeners/subscriptions.
- A slow client causes process-wide memory growth.
- Connection authentication is performed but later tenant access is assumed forever.
- Global connection registries retain closed sockets.
- Shutdown waits indefinitely for a client.

## Verification
Load-test connection churn and slow consumers; verify bounded memory and deterministic cleanup. WebSocket browser APIs do not provide built-in backpressure, so server/application design must address it explicitly.
Source: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
