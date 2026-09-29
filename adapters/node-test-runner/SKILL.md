---
name: adapter-node-test-runner
description: Use when the repository uses Node.js native test runner.
---

# Node.js native test runner adapter

## Purpose

Translate framework-neutral Node.js guidance into Node.js native test runner-specific mechanics.

## Activate when

- Node.js native test runner is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, Node.js version, imports, and test/auth construction.
2. Confirm the exact installed version.
3. Locate lifecycle ownership and existing integration boundaries.
4. Read neighboring tests and CI scripts.

## Decision rules

- Core skills remain authoritative for correctness, security, retries, observability, and architecture.
- Do not infer APIs from memory when the package version is not confirmed.
- Treat provider/network data as untrusted runtime input.
- Keep secrets and tokens out of logs and test artifacts.

## Implementation procedure

1. Detect Node.js native test runner and exact version.
2. Select the owning framework-neutral skill.
3. Apply Node.js native test runner-specific APIs and lifecycle behavior.
4. Add focused boundary tests including failure and cleanup.
5. Verify CI and production configuration.

## Failure modes

- Examples copied from incompatible versions.
- Hidden lifecycle/resource leaks.
- Tests that assert framework internals rather than observable behavior.
- Credentials or tokens appearing in diagnostics.

## Verification

1. Run focused adapter tests.
2. Run the full repository test suite.
3. Run build/typecheck gates.
4. Verify failure, cleanup, and security behavior.

## Source

https://nodejs.org/docs/latest-v24.x/api/test.html

## Version scope

Node 24.x `node:test`.

## Adapter guidance

Use the built-in `node:test` APIs that exist in the detected Node version. Keep tests deterministic; use concurrency only with isolated state; use built-in mocks selectively; configure reporters/coverage through supported Node flags. Do not import Jest/Vitest semantics into node:test.
