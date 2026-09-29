---
name: adapter-pino
description: Use when the repository uses Pino.
---

# Pino adapter

## Purpose

Translate framework-neutral Node.js guidance into Pino-specific implementation decisions without replacing the core skill.

## Activate when

- Pino is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, workspace configuration, and imports.
2. Confirm the exact installed version.
3. Locate resource construction and lifecycle/shutdown ownership.
4. Inspect existing boundary tests and mocks/fakes.

## Decision rules

- Prefer one application-owned lifecycle for long-lived resources.
- Keep auth, runtime validation, retries, persistence, and observability in their owning core skills.
- Treat provider responses as untrusted runtime data.
- Do not infer APIs from memory; verify the installed version.

## Implementation procedure

1. Detect Pino and its exact version.
2. Select the framework-neutral owner for the boundary.
3. Apply Pino-specific mechanics.
4. Add focused failure and cleanup tests.
5. Verify startup, shutdown, and observability behavior.

## Failure modes

- Copying examples from another major version.
- Creating reusable clients per request.
- Hiding provider failure/retry semantics in generic helpers.
- Testing only mocks when the real boundary has meaningful behavior.

## Verification

1. Run focused integration tests.
2. Run the full suite and build/typecheck gates.
3. Verify lifecycle cleanup and production configuration.
4. Verify sensitive data is absent from logs/metrics.

## Source

https://getpino.io/

## Version scope

current Pino.

## Adapter guidance

Use structured loggers and child bindings for request/correlation context; configure redaction; avoid huge payload serialization; never log credentials or sensitive payloads by default.
