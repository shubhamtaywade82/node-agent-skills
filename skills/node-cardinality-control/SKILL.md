---
name: node-cardinality-control
description: Use when user IDs, URLs, request IDs, or unbounded resource names are telemetry attributes.
---

# Telemetry Cardinality Control

## Purpose

preventing metrics/traces from exploding in label cardinality.

## Activate when

- user IDs, URLs, request IDs, or unbounded resource names are telemetry attributes.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

metric label sets must remain bounded; high-cardinality data belongs in logs/traces

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Inventory labels.
2. Classify bounded dimensions.
3. Normalize paths.
4. Cap dynamic values.
5. Monitor series count.

## Failure modes

Avoid:

- user ID as metric label; raw URL paths; unbounded exception messages as labels.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
