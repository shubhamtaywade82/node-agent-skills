---
name: node-worker-threads
description: Use when CPU-heavy computation blocks the event loop and cannot be moved to an external service.
---

# Worker Thread Engineering

## Purpose

using worker_threads for CPU-bound work while preserving bounded resources and safe data transfer.

## Activate when

- CPU-heavy computation blocks the event loop and cannot be moved to an external service.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

workers are a capacity-limited pool; startup/teardown and transfer costs matter; shared memory requires synchronization; untrusted code still needs stronger isolation

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Measure event-loop impact.
2. Define job protocol.
3. Bound pool size.
4. Handle worker failure/restart.
5. Minimize serialization.
6. Propagate cancellation.
7. Test overload and teardown.

## Failure modes

Avoid:

- one worker per request; unbounded worker pool; sharing mutable memory casually; assuming workers are process-level security isolation.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
