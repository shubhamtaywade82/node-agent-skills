---
name: node-archive-extraction-safety
description: Use when users or integrations upload archives that the service extracts.
---

# Archive Extraction Safety

## Purpose

extracting zip/tar-like archives without path traversal, symlink, bomb, or resource exhaustion risk.

## Activate when

- users or integrations upload archives that the service extracts.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

archive entries are untrusted; extraction has quotas; destinations remain contained; links and special files follow an explicit deny policy

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Inspect entry names/types.\n2. Reject escapes and unsafe links.\n3. Enforce file/count/uncompressed-size limits.\n4. Extract to quarantine.\n5. Verify final paths.\n6. Test malicious archives.

## Failure modes

Avoid:

- extracting directly into a shared application root; trusting entry names; ignoring compression ratio; preserving arbitrary symlinks.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
