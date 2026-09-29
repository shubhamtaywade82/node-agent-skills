---
name: node-path-traversal-defense
description: Use when HTTP or job input selects filesystem or object-storage resources.
---

# Path Traversal Defense

## Purpose

preventing traversal through file/object names.

## Activate when

- HTTP or job input selects filesystem or object-storage resources.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

authorization and path containment are independent checks

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Decode/canonicalize input.
2. Reject traversal semantics.
3. Enforce trusted root.
4. Authorize resource.
5. Test encoded separators and platform variants.

## Failure modes

Avoid:

- checking only ../; decoding after validation; authorizing the raw path.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
