---
name: node-abort-cancellation
description: Use when HTTP disconnects, shutdown, timeouts, or upstream cancellation should stop unnecessary work.
---

# Abort and Cancellation

## Purpose

propagating cancellation and deadlines through Node.js asynchronous work.

## Activate when

- HTTP disconnects, shutdown, timeouts, or upstream cancellation should stop unnecessary work.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

cancellation is cooperative; every cancellable boundary must observe AbortSignal where supported; cleanup remains guaranteed

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Create one authoritative signal.
2. Derive child deadlines.
3. Pass signal to network/stream/DB operations where supported.
4. Clean up on abort.
5. Test mid-operation cancellation.

## Failure modes

Avoid:

- ignoring AbortSignal; cancellation after side effect without compensation; swallowing AbortError and continuing work.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
