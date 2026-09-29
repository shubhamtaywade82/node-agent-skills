---
name: node-query-plan-engineering
description: Use when queries are slow or resource-heavy.
---

# Query Plan Engineering

## Purpose

improving database execution plans with evidence.

## Activate when

- queries are slow or resource-heavy.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

EXPLAIN/ANALYZE evidence drives changes; plans are validated against representative data

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Capture query.
2. Inspect actual plan.
3. Identify scan/join/sort bottleneck.
4. Change query/index/statistics.
5. Benchmark.
6. Compare plan.

## Failure modes

Avoid:

- optimizing estimated plan only; tiny fixture data; forcing hints without evidence.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
