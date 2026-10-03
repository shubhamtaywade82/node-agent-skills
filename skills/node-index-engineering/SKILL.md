---
name: node-index-engineering
description: Use when queries need indexes or existing indexes are ineffective.
---

# Index Engineering

## Purpose

designing indexes for actual access paths.

## Activate when

- queries need indexes or existing indexes are ineffective.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

index order and selectivity match predicates/order; write/storage costs are explicit

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Collect query shapes.
2. Choose composite/partial/covering strategy.
3. Test planner use.
4. Measure write cost.
5. Plan online deployment.

## Failure modes

Avoid:

- one index per column; redundant indexes; indexing without workload evidence.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
