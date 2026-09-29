---
name: adapter-hapi
description: Use when the repository uses Hapi.
---

# Hapi adapter

## Purpose

Translate framework-neutral Node.js guidance into Hapi-specific mechanics.

## Activate when

- Hapi is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, Node.js version, imports, server construction, and lifecycle configuration.
2. Confirm the exact installed version.
3. Locate routes/plugins/resolvers, validation, authentication, and shutdown ownership.
4. Read integration tests and CI commands.

## Decision rules

- Core Node.js skills remain authoritative for architecture, security, validation, reliability, and lifecycle.
- Detect exact versions before applying APIs.
- Keep domain logic independent from framework lifecycle objects.
- Treat incoming headers, payloads, GraphQL variables, and resolver results as runtime data.

## Implementation procedure

1. Detect Hapi and exact version.
2. Select the owning framework-neutral skill.
3. Apply Hapi-specific route/plugin/resolver/lifecycle mechanics.
4. Add focused HTTP/integration coverage including failure and cleanup.
5. Run full repository validation.

## Failure modes

- Copying APIs from incompatible framework versions.
- Leaking server lifecycle ownership across modules.
- Binding security policy to framework defaults without tests.
- Leaving sockets/workers/subscriptions open after tests or shutdown.

## Verification

1. Run focused integration tests.
2. Run the full suite and build/typecheck gates.
3. Exercise invalid input, auth failures, shutdown, and connection cleanup.
4. Review configuration for unintended exposure.

## Source

https://hapi.dev/api/21.x.x

## Version scope

21.x.

## Adapter guidance

Use Hapi's server lifecycle and route configuration rather than introducing an external middleware abstraction. Keep request validation, auth, payload limits, and lifecycle extensions explicit. Use initialize/start/stop ownership correctly and test both handler behavior and server lifecycle.
