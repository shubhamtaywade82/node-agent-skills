---
name: node-tenant-cache-isolation
description: Use when a multi-tenant backend uses shared application or Redis caches.
---

# Tenant Cache Isolation

## Purpose

ensuring cached state cannot cross tenant boundaries.

## Activate when

- a multi-tenant backend uses shared application or Redis caches.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

tenant isolation is part of the cache contract; global caches require explicit safety analysis; keys and invalidation preserve tenant ownership

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Identify tenant boundary.
2. Namespace cache keys.
3. Enforce tenant context.
4. Audit shared values.
5. Test same-resource/different-tenant cases.

## Failure modes

Avoid:

- tenant ID omitted from key; global invalidation causing incorrect data; trusting client-provided tenant without authenticated context.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
