---
name: node-heap-diagnostics
description: Use when heap growth or OOM requires object-retention analysis.
---

# Heap Diagnostics

## Purpose

using heap snapshots and allocation evidence safely.

## Activate when

- heap growth or OOM requires object-retention analysis.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

snapshots can contain secrets and are sensitive artifacts

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Capture in controlled environment.
2. Minimize exposure.
3. Compare snapshots.
4. Trace retainers.
5. Delete artifacts securely.

## Failure modes

Avoid:

- capturing production secrets casually; leaving snapshots accessible; interpreting shallow size only.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
