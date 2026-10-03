---
name: node-read-replica-routing
description: Use when a service has read replicas and consistency-sensitive workloads.
---

# Read Replica Routing

## Purpose

routinging safe reads to database replicas.

## Activate when

- a service has read replicas and consistency-sensitive workloads.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

replica reads tolerate lag; writes and read-after-write flows use authoritative primary

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Classify queries.
2. Define consistency policy.
3. Route safe reads.
4. Support fallback.
5. Expose replica lag.
6. Test stale-read scenarios.

## Failure modes

Avoid:

- sending all reads to replicas; ignoring lag; assuming read-your-write consistency.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
