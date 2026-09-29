---
name: node-connection-pooler-engineering
description: Use when multiple app processes or poolers share finite database connections.
---

# Connection Pooler Engineering

## Purpose

sizing and configuring Node database pools together with upstream poolers and database limits.

## Activate when

- multiple app processes or poolers share finite database connections.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

total connection budget is calculated across replicas/processes; pool size, queueing, timeouts, and database max connections are aligned

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Inventory process count.\n2. Compute total possible connections.\n3. Set pool caps/queue time.\n4. Observe saturation.\n5. Test failover and bursts.\n6. Document budget.

## Failure modes

Avoid:

- per-process pool sizing in isolation; multiplying pools until DB exhaustion; hiding saturation by increasing max connections.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
