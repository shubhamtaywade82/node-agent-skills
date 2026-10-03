---
name: node-etag-cache-validation
description: Use when resources benefit from validators such as ETag or Last-Modified.
---

# ETag and Cache Validation

## Purpose

implementing conditional GET/HEAD efficiently and correctly.

## Activate when

- resources benefit from validators such as ETag or Last-Modified.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

validators represent the selected representation; weak/strong semantics are deliberate; 304 responses preserve required headers

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Define validator source.\n2. Generate stable representation validators.\n3. Evaluate If-None-Match before body serialization where possible.\n4. Handle HEAD.\n5. Test representation changes.

## Failure modes

Avoid:

- etag based on unstable object serialization; treating weak tags as byte identity; returning 200 after a matching validator.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
