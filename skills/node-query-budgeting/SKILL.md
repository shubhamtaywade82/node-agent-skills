---
name: node-query-budgeting
description: Use when an API request can trigger many queries or expensive combinations.
---

# Query Budgeting

## Purpose

controlling per-request database query count and latency budgets.

## Activate when

- an API request can trigger many queries or expensive combinations.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

query budgets are explicit per endpoint/workflow; violation is observable; budgets prevent abuse without breaking normal variability

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Measure representative query counts.\n2. Define count/time budget.\n3. Detect N+1.\n4. Batch where safe.\n5. Test pathological requests.\n6. Expose budget metrics.

## Failure modes

Avoid:

- fixed tiny query limits without evidence; counting only ORM calls; masking N+1 with broad caches.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
