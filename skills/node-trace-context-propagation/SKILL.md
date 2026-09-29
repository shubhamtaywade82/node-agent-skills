---
name: node-trace-context-propagation
description: Use when services participate in distributed traces.
---

# Trace Context Propagation

## Purpose

preserving distributed tracing context across HTTP, queues, and async work.

## Activate when

- services participate in distributed traces.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

accept and propagate standard context only after boundary validation; do not trust trace identity for authorization

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Extract context.
2. Validate format.
3. Create child spans.
4. Inject outbound context.
5. Propagate through jobs.
6. Test missing/malformed context.

## Failure modes

Avoid:

- using trace IDs for auth; propagating unbounded baggage; losing context at async boundaries.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
