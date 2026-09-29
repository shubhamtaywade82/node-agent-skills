---
name: node-serverless
description: Use when building or adapting Node.js backends for serverless functions, including cold starts, stateless execution, connection reuse, concurrency, timeouts, retries, and event-driven invocations.
---

# Serverless Runtime

## Purpose
Treat function invocations as ephemeral while making durable state, retries, connections, and concurrency explicit.

## Activate when
- Deploying Node.js handlers to a serverless platform.
- Converting a long-lived service into functions.
- Processing queue/event triggers through functions.

## Repository inspection
Inspect handler lifecycle, invocation timeout, concurrency, retries, event source, connection management, temporary filesystem, environment configuration, and idempotency.

## Decision rules
| Concern | Rule |
|---|---|
| State | Durable state lives outside the process; local caches are opportunistic. |
| Initialization | Do not assume process reuse; separate initialization from invocation input handling. |
| Connections | Reuse safely when instances persist, but bound creation for bursts. |
| Retries | Assume event delivery can repeat unless the provider proves otherwise. |
| Timeout | Align handler timeout with downstream deadlines and platform limits. |
| Shutdown | Do not depend on long-lived shutdown hooks for invocation correctness. |

## Implementation procedure
1. Model one invocation and its failure/retry lifecycle.
2. Move durable state behind explicit persistence.
3. Bound dependency calls and connections.
4. Make retry-prone handlers idempotent.
5. Minimize cold-start work.
6. Test timeout, duplicate, partial-failure, and warm/cold behavior.

## Failure modes
- Process-local state is treated as durable.
- Connection creation explodes during concurrency bursts.
- Event retries create duplicate mutations.
- Handler timeout leaves downstream work ambiguous.

## Verification
Test cold/warm behavior, connection bounds, duplicate events, timeout propagation, and event-source failure handling.