---
name: node-memory-leak-diagnostics
description: Use when RSS/heap grows across stable workloads or GC cannot reclaim expected objects.
---

# Memory Leak Diagnostics

## Purpose

finding retained objects and unbounded growth in Node.js heap usage.

## Activate when

- RSS/heap grows across stable workloads or GC cannot reclaim expected objects.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

leak diagnosis compares repeated snapshots under controlled load; distinguish heap from native/external memory

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Reproduce sustained workload.\n2. Monitor heap/RSS/external memory.\n3. Compare heap snapshots.\n4. Identify retaining paths.\n5. Fix owner lifecycle.\n6. Verify after multiple cycles.

## Failure modes

Avoid:

- taking one snapshot and guessing; increasing heap limit as the only fix; ignoring buffers/native memory.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
