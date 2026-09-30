---
name: node-permission-model
description: Use when the runtime is deployed with Node's permission model or the task evaluates reducing process authority.
---

# Node Permission Model

## Purpose

using Node.js process permissions as a defense-in-depth control for filesystem, child-process, worker, and related access.

## Activate when

- the runtime is deployed with Node's permission model or the task evaluates reducing process authority.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

the permission model limits trusted code by explicit grants but is not a sandbox for malicious code; use OS/container isolation for hostile code; audit before enforce

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Inspect Node version and launch flags.
2. Run permission audit.
3. Identify required resources.
4. Grant the narrowest paths/scopes.
5. Test denied access.
6. Document exceptions and operator assumptions.

## Failure modes

Avoid:

- treating the permission model as a security boundary against malicious packages; granting broad wildcards; enabling it without testing required startup/runtime capabilities.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
