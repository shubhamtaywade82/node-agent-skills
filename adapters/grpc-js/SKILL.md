---
name: adapter-grpc-js
description: Use when the repository uses gRPC Node.
---

# gRPC Node adapter

## Purpose

Translate framework-neutral Node.js guidance into gRPC Node-specific mechanics.

## Activate when

- gRPC Node is present in the target repository.
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

1. Detect gRPC Node and its exact version.
2. Select the framework-neutral skill owner.
3. Apply gRPC Node-specific lifecycle and API conventions.
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

https://grpc.io/docs/languages/node/basics/

## Version scope

current @grpc/grpc-js.

## Adapter guidance

Define services in .proto files; keep client/server lifecycle explicit; propagate deadlines/cancellation; map gRPC status codes intentionally; test unary and streaming failure/cleanup.
