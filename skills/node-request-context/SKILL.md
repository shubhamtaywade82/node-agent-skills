---
name: node-request-context
description: Use when multiple layers need request metadata without threading ad hoc parameters through every function.
---

# Request Context

## Purpose

designing a small request-scoped context for correlation, deadlines, identity, and feature metadata.

## Activate when

- multiple layers need request metadata without threading ad hoc parameters through every function.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

context contains operational metadata, not arbitrary business state; ownership and lifecycle are explicit; cancellation/deadlines remain authoritative

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Define context interface.
2. Create at request boundary.
3. Attach identity only after authentication.
4. Include deadline/correlation.
5. Pass explicitly or via safe async context.
6. Clear on completion.

## Failure modes

Avoid:

- putting mutable domain state into context; trusting context values without boundary validation; unbounded context growth.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
