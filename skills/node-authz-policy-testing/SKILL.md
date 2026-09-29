---
name: node-authz-policy-testing
description: Use when roles, permissions, resources, tenants, and ownership affect access.
---

# Authorization Policy Testing

## Purpose

testing authorization rules as policy decisions rather than incidental controller branches.

## Activate when

- roles, permissions, resources, tenants, and ownership affect access.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

tests cover allow/deny boundaries and default-deny behavior; authentication state is distinguished from authorization policy

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Model policy inputs.\n2. Create matrix tests.\n3. Cover resource ownership/tenant boundaries.\n4. Test unknown roles/actions.\n5. Exercise policy through real boundary tests where possible.

## Failure modes

Avoid:

- testing only happy-path roles; duplicating policy in tests instead of asserting outcomes; allowing unknown permissions by default.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
