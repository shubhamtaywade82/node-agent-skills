---
name: node-runtime-feature-detection
description: Use when code supports multiple Node releases or optional runtime features.
---

# Runtime Feature Detection

## Purpose

detecting Node.js capabilities without brittle version assumptions.

## Activate when

- code supports multiple Node releases or optional runtime features.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

feature detection is preferred when stable APIs expose capability; version gates remain explicit where semantics differ

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Identify minimum engine.
2. Detect capability.
3. Isolate compatibility path.
4. Test supported runtimes.
5. Remove obsolete fallback deliberately.

## Failure modes

Avoid:

- parsing process.version everywhere; assuming backported features; silently using unsupported APIs.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
