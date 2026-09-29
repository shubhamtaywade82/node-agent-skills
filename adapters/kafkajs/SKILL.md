---
name: adapter-kafkajs
description: Use when the repository uses KafkaJS.
---

# KafkaJS adapter

## Purpose

Translate framework-neutral Node.js guidance into KafkaJS-specific implementation decisions without replacing the core skill.

## Activate when

- KafkaJS is present in the target repository.
- The detected version matches the scope below.

## Repository inspection

1. Inspect package.json, lockfile, workspace configuration, and imports.
2. Confirm the exact installed version.
3. Locate client/consumer/logger/validator construction and shutdown ownership.
4. Inspect existing integration tests and mocks/fakes.

## Decision rules

- Prefer one application-owned lifecycle for long-lived resources.
- Keep auth, runtime validation, retries, persistence, and observability in their core skills.
- Treat provider responses and messages as untrusted runtime data.
- Avoid version-specific assumptions until the installed version is confirmed.

## Implementation procedure

1. Detect KafkaJS and its exact version.
2. Select the framework-neutral owner for the boundary.
3. Apply KafkaJS-specific lifecycle/API mechanics.
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

https://kafka.js.org/docs/getting-started

## Version scope

KafkaJS 2.x.

## Adapter guidance

Own producer/consumer lifecycle explicitly; assume at-least-once delivery; design keys/partitions deliberately; commit offsets according to processing semantics; instrument lag and retry/dead-letter behavior.
