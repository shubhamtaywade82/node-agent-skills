---
name: adapter-zod
description: Use when the repository uses Zod.
---

# Zod adapter

## Purpose

Translate framework-neutral Node.js guidance into Zod-specific implementation decisions without replacing the core skill.

## Activate when

- Zod is present in the target repository.
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

1. Detect Zod and its exact version.
2. Select the framework-neutral owner for the boundary.
3. Apply Zod-specific lifecycle/API mechanics.
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

https://zod.dev/packages/zod

## Version scope

Zod 4.x.

## Adapter guidance

Parse unknown boundary data with executable schemas; use parse/safeParse deliberately; keep transformations visible; do not replace authorization or database constraints with schemas.
