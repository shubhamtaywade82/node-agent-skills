---
name: node-cache-key-security
description: Use when cached data depends on identity, authorization, locale, or resource scope.
---

# Cache Key Security

## Purpose

designing cache keys that cannot collide across tenants, users, roles, or security contexts.

## Activate when

- cached data depends on identity, authorization, locale, or resource scope.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

keys encode every dimension needed to preserve correctness/security; cache hits never bypass current authorization; user-controlled key material is bounded

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Identify authorization dimensions.
2. Design canonical key.
3. Namespace by tenant/resource.
4. Bound key length.
5. Invalidate on permission-sensitive changes.
6. Test cross-tenant collision.

## Failure modes

Avoid:

- caching by resource ID alone; including raw user input without canonicalization; trusting cache hit as authorization.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
