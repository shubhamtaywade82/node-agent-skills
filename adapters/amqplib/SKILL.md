---
name: adapter-amqplib
description: Use when the repository uses amqplib / RabbitMQ.
---

# amqplib / RabbitMQ adapter

## Purpose

Translate framework-neutral Node.js guidance into amqplib / RabbitMQ-specific mechanics.

## Activate when

- amqplib / RabbitMQ is present in the target repository.
- The detected installed version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, workspace configuration, imports, and generated artifacts.
2. Confirm the exact installed version.
3. Locate connection/client construction, lifecycle ownership, and shutdown.
4. Inspect existing integration tests and failure handling.

## Decision rules

- Keep the core skill responsible for architecture, contracts, retries, security, persistence, and observability.
- Reuse long-lived clients/connections where the library expects them.
- Treat provider data and message payloads as untrusted runtime values.
- Do not infer version-specific APIs.

## Implementation procedure

1. Detect amqplib / RabbitMQ and its exact version.
2. Select the framework-neutral skill owner.
3. Apply amqplib / RabbitMQ-specific lifecycle and API conventions.
4. Add failure, duplicate, timeout, and cleanup coverage.
5. Verify production startup and graceful shutdown.

## Failure modes

- Copying examples from incompatible versions.
- Creating a connection/client per request.
- Acknowledging or committing work before durable effects.
- Hiding provider failures behind generic success responses.

## Verification

1. Run focused adapter integration tests.
2. Run the full suite and build/typecheck gates.
3. Verify connection/client cleanup and secret handling.
4. Exercise retry/replay/timeout behavior relevant to the integration.

## Source

https://www.rabbitmq.com/tutorials/tutorial-one-javascript

## Version scope

current amqplib.

## Adapter guidance

Own connections/channels explicitly; use durable queues and explicit acknowledgement semantics; handle connection/channel errors; bound prefetch and consumer work; design retries/DLQs rather than infinite redelivery.
