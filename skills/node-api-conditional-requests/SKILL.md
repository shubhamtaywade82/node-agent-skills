---
name: node-api-conditional-requests
description: Use when clients or proxies need conditional GET/PUT behavior.
---

# Conditional HTTP Requests

## Purpose

using ETag/If-None-Match and related validators correctly.

## Activate when

- clients or proxies need conditional GET/PUT behavior.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

validators represent selected representation; weak/strong semantics follow HTTP rules

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Generate stable validators.
2. Process conditional headers.
3. Return 304/412 correctly.
4. Test concurrent updates.

## Failure modes

Avoid:

- hashing arbitrary unstable serialization; treating weak validators as strong; returning 304 with a changed representation.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
