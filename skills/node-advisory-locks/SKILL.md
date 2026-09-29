---
name: node-advisory-locks
description: Use when work cannot be naturally represented by row locks.
---

# PostgreSQL Advisory Locks

## Purpose

using advisory locks for cross-row application coordination.

## Activate when

- work cannot be naturally represented by row locks.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

lock keys are deterministic and namespaced; ownership is transaction/session scoped intentionally

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Define key scheme.
2. Choose transaction/session lock.
3. Acquire with timeout policy.
4. Release on connection lifecycle.
5. Test contention.

## Failure modes

Avoid:

- hash collisions; session locks on pooled connections without ownership; deadlocks.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
