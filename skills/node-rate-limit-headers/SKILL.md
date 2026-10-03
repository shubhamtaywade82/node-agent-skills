---
name: node-rate-limit-headers
description: Use when APIs enforce request or resource rate limits.
---

# Rate Limit Headers

## Purpose

communicating throttling budgets consistently through HTTP response headers.

## Activate when

- APIs enforce request or resource rate limits.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

header semantics match the configured policy; values are bounded and do not leak internal topology; status behavior is consistent

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Define quota window/remaining/reset semantics.\n2. Emit stable headers.\n3. Align 429 responses and Retry-After.\n4. Test boundary behavior.\n5. Document client expectations.

## Failure modes

Avoid:

- negative remaining values; per-node headers for distributed limits; exposing privileged internal quotas.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
