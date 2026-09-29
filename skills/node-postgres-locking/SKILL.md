---
name: node-postgres-locking
description: Use when concurrent workflows require serialization.
---

# PostgreSQL Locking

## Purpose

using PostgreSQL row/table locks safely from Node.js.

## Activate when

- concurrent workflows require serialization.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

lock scope/order/duration are explicit and transactions stay short

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Identify lock mode.
2. Acquire deterministically.
3. Bound transaction.
4. Handle NOWAIT/SKIP LOCKED intentionally.
5. Test concurrency.

## Failure modes

Avoid:

- holding locks over network calls; inconsistent order; accidental table locks.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
