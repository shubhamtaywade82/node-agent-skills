---
name: node-memory-leak-diagnostics
description: Use when RSS/heap grows across steady-state workload.
---

# Memory Leak Diagnostics

## Purpose

diagnosing growing heap or retained objects.

## Activate when

- RSS/heap grows across steady-state workload.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

diagnosis compares equivalent workloads and heap behavior over time

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Capture baseline.
2. Reproduce sustained workload.
3. Inspect heap usage/GC.
4. Identify retention path.
5. Verify after fix.

## Failure modes

Avoid:

- raising heap limit as fix; comparing unrelated workloads; relying on one snapshot.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
