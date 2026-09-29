---
name: node-api-conditional-requests
description: Use when clients use optimistic concurrency or cache validation headers.
---

# Conditional Request Handling

## Purpose

handling If-Match, If-None-Match, If-Modified-Since, and related preconditions.

## Activate when

- clients use optimistic concurrency or cache validation headers.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

preconditions run before mutation/read processing according to HTTP semantics; authorization still applies

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Classify safe vs state-changing operations.\n2. Evaluate preconditions.\n3. Return correct precondition failures.\n4. Integrate resource versioning.\n5. Test races and missing validators.

## Failure modes

Avoid:

- skipping authorization because precondition failed; evaluating preconditions after mutation; mixing cache and concurrency semantics.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
