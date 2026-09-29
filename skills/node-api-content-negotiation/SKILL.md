---
name: node-api-content-negotiation
description: Use when APIs serve multiple representations or enforce media types.
---

# API Content Negotiation

## Purpose

handling Accept and Content-Type negotiation explicitly.

## Activate when

- APIs serve multiple representations or enforce media types.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

unsupported representations fail predictably; response type matches negotiated contract

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Define supported media types.
2. Parse quality values.
3. Select deterministically.
4. Set Vary.
5. Test unsupported/ambiguous headers.

## Failure modes

Avoid:

- ignoring Accept; echoing arbitrary content types; missing Vary.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
