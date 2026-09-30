---
name: node-ssrf-defense
description: Use when the service accepts callback URLs, imports remote resources, webhooks, or arbitrary fetch targets.
---

# SSRF Defense

## Purpose

preventing server-side request forgery when backend code fetches URLs derived from user or external data.

## Activate when

- the service accepts callback URLs, imports remote resources, webhooks, or arbitrary fetch targets.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

allowlist destinations where possible; resolve and validate IPs/hosts; block private/link-local/metadata targets; revalidate after redirects/DNS changes; enforce egress policy

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Define allowed schemes/ports/hosts.
2. Parse canonical URL.
3. Resolve DNS.
4. Block prohibited ranges.
5. Disable or validate redirects.
6. Apply connect/read deadlines.
7. Test bypass variants.

## Failure modes

Avoid:

- string-prefix URL allowlists; checking hostname once and trusting redirects; permitting localhost/private ranges; DNS rebinding bypass.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
