---
name: node-process-supervision
description: Use when services need restart, shutdown, health, or crash semantics.
---

# Process Supervision

## Purpose

supervising long-running Node.js processes and workers.

## Activate when

- services need restart, shutdown, health, or crash semantics.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

supervision owns lifecycle and restart budgets; application code remains responsible for cleanup

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Define process lifecycle.
2. Handle signals.
3. Drain work.
4. Bound restart loops.
5. Expose exit reason.
6. Coordinate child/worker shutdown.

## Failure modes

Avoid:

- restart storms; swallowing fatal errors; double shutdown; orphaned children.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
