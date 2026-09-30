---
name: node-async-context-propagation
description: Use when logs/traces/authz decisions need context across promises, timers, workers, or callbacks.
---

# Async Context Propagation

## Purpose

preserving request, trace, tenant, or correlation context across asynchronous execution.

## Activate when

- logs/traces/authz decisions need context across promises, timers, workers, or callbacks.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

context must be immutable or carefully scoped; context propagation must not leak across concurrent requests; use platform-supported async context mechanisms

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Define context fields.
2. Establish context at boundary.
3. Propagate through async work.
4. Isolate concurrent requests.
5. Integrate logging/tracing.
6. Test nested and parallel operations.

## Failure modes

Avoid:

- global mutable request context; accidental tenant/user leakage; context surviving beyond request lifetime.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
