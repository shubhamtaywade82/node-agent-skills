---
name: node-telemetry-sampling
description: Use when high traffic makes full telemetry too costly or noisy.
---

# Telemetry Sampling

## Purpose

controlling trace/log/metric sampling without losing critical evidence.

## Activate when

- high traffic makes full telemetry too costly or noisy.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

sampling policy preserves errors and important paths while bounding volume

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Define baseline rate.
2. Retain errors.
3. Use deterministic attributes where appropriate.
4. Observe dropped volume.
5. Test policy.

## Failure modes

Avoid:

- randomly dropping failures; sampling after high-cardinality labels; no operational visibility into sampling.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
