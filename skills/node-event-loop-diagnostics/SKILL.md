---
name: node-event-loop-diagnostics
description: Use when latency spikes or low throughput suggest synchronous/blocking work.
---

# Event Loop Diagnostics

## Purpose

finding event-loop stalls and CPU blocking.

## Activate when

- latency spikes or low throughput suggest synchronous/blocking work.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

measure event-loop delay/utilization and correlate with workload

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Instrument delay/utilization.
2. Identify blocking stack.
3. Isolate CPU work.
4. Move bounded work to workers.
5. Verify latency.

## Failure modes

Avoid:

- using average latency only; spawning unlimited workers; blaming network for CPU stalls.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
