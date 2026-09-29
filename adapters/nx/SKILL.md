---
name: adapter-nx
description: Use when the repository uses Nx.
---

# Nx adapter

## Purpose

Translate framework-neutral Node.js guidance into Nx-specific implementation decisions without replacing the core skill.

## Activate when

- Nx is present in the target repository.
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

1. Detect Nx and its exact version.
2. Select the framework-neutral owner for the boundary.
3. Apply Nx-specific mechanics.
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

https://nx.dev/docs/features

## Version scope

current Nx.

## Adapter guidance

Use project/task graphs for dependency-aware execution; configure cache inputs/outputs correctly; do not cache stateful E2E blindly; use affected execution only when the graph is trustworthy.
