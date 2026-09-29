---
name: adapter-protobufjs
description: Use when the repository uses protobuf.js.
---

# protobuf.js adapter

## Purpose

Translate framework-neutral Node.js guidance into protobuf.js-specific mechanics.

## Activate when

- protobuf.js is present in the target repository.
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

1. Detect protobuf.js and its exact version.
2. Select the framework-neutral skill owner.
3. Apply protobuf.js-specific lifecycle and API conventions.
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

https://github.com/protobufjs/protobuf.js/

## Version scope

current protobufjs.

## Adapter guidance

Treat .proto schemas as wire contracts; choose reflection vs generated code deliberately; keep generated artifacts reproducible; validate encode/decode compatibility and avoid editing generated output by hand.
