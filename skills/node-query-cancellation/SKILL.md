---
name: node-query-cancellation
description: Use when a request aborts or a job deadline expires during a database operation.
---

# Database Query Cancellation

## Purpose

cancelling in-flight database work when requests, jobs, or workflows are aborted.

## Activate when

- a request aborts or a job deadline expires during a database operation.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

cancellation reaches the database driver when supported; cleanup preserves pool health; partial side effects are understood

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Propagate AbortSignal/deadline.\n2. Use driver cancellation.\n3. Clean up statement/connection.\n4. Test mid-query abort.\n5. Verify subsequent pool usability.

## Failure modes

Avoid:

- aborting local promise without canceling server query; returning connection before cancel completes; treating cancellation as success.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
