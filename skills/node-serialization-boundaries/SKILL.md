---
name: node-serialization-boundaries
description: Use when data crosses process/network/storage boundaries.
---

# Serialization Boundaries

## Purpose

designing explicit serialization contracts between services, workers, caches, and persistent data.

## Activate when

- data crosses process/network/storage boundaries.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

wire formats are versioned or documented; sensitive fields and prototypes are controlled; serialization is deterministic where signatures/cache keys depend on it

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Define schema.\n2. Choose serializer.\n3. Validate on ingress/egress.\n4. Normalize dates/bytes/undefined.\n5. Version changes.\n6. Test round trips and malformed payloads.

## Failure modes

Avoid:

- serializing arbitrary class instances; relying on object key order for protocol semantics; accepting unvalidated deserialized data.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
