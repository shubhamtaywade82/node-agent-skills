---
name: node-heap-diagnostics
description: Use when the service needs detailed heap metrics or snapshots.
---

# Heap Diagnostics

## Purpose

using Node.js heap information safely to diagnose allocation pressure.

## Activate when

- the service needs detailed heap metrics or snapshots.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

heap diagnostics may contain secrets and must be access-controlled; collection is expensive and typically sampled/on-demand

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Define authorized collection path.\n2. Inspect heap statistics.\n3. Capture snapshots only with operational controls.\n4. Redact/export securely.\n5. Compare before/after.

## Failure modes

Avoid:

- exposing heap snapshots over public endpoints; collecting continuously in production; shipping sensitive snapshots to third parties.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
