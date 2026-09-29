---
name: node-http-cache-semantics
description: Use when responses are cacheable or proxied.
---

# HTTP Cache Semantics

## Purpose

designing cache behavior for HTTP APIs.

## Activate when

- responses are cacheable or proxied.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

Cache-Control, Vary, validators, and authorization semantics are explicit

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Classify response cacheability.
2. Set directives.
3. Include Vary.
4. Avoid caching private data publicly.
5. Test proxy behavior.

## Failure modes

Avoid:

- public caching of personalized responses; Vary omission; caching errors unintentionally.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
