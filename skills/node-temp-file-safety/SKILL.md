---
name: node-temp-file-safety
description: Use when backend work needs temporary filesystem state.
---

# Temporary File Safety

## Purpose

creating temporary files/directories for uploads, archives, conversions, or intermediates.

## Activate when

- backend work needs temporary filesystem state.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

temporary names are unpredictable; lifetime and ownership are bounded; cleanup occurs on success, error, abort, and shutdown; permissions are restrictive

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Use OS temp primitives.\n2. Create private directories.\n3. Write with exclusive creation.\n4. Register cleanup.\n5. Cap size/count.\n6. Test crash/abort cleanup.\n7. Exclude secrets from temp logs.

## Failure modes

Avoid:

- predictable names; shared temp directory permissions; leaving files after cancellation; storing credentials in temp files.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
