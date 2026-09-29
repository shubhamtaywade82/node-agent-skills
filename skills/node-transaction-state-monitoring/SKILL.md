---
name: node-transaction-state-monitoring
description: Use when database transactions can remain open or enter failed state.
---

# Transaction State Monitoring

## Purpose

observing transaction health and detecting stuck or aborted transaction states.

## Activate when

- database transactions can remain open or enter failed state.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

transaction lifecycle is observable; aborted transactions are rolled back before connection reuse; long-open transactions alert on actionable thresholds

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Instrument begin/commit/rollback.\n2. Detect open age.\n3. Recover aborted state.\n4. Correlate with request/job.\n5. Test exception paths.\n6. Monitor transaction age.

## Failure modes

Avoid:

- returning connections with failed transactions; relying only on query latency; leaving transactions open across awaits.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
