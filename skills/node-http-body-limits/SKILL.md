---
name: node-http-body-limits
description: Use when HTTP endpoints accept JSON, forms, multipart metadata, or custom payloads.
---

# HTTP Body Limits

## Purpose

bounding request bodies and parser resource consumption.

## Activate when

- HTTP endpoints accept JSON, forms, multipart metadata, or custom payloads.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

limits are part of API/resource policy; reject oversized input before expensive parsing when possible; different routes may need different budgets

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Define per-route limits.
2. Configure framework/parser limits.
3. Cap decompression expansion.
4. Return consistent errors.
5. Monitor rejections.
6. Test boundary sizes.

## Failure modes

Avoid:

- one huge global limit; parser allocation before limit enforcement; inconsistent limits across ingress layers.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
