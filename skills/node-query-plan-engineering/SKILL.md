---
name: node-query-plan-engineering
description: Use when a slow or resource-heavy query needs systematic optimization.
---

# Query Plan Engineering

## Purpose

using EXPLAIN/query plans to diagnose database access paths.

## Activate when

- a slow or resource-heavy query needs systematic optimization.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

plans are evaluated against representative statistics/data; planner changes are measured rather than assumed

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Capture baseline plan.\n2. Inspect scans/joins/sorts.\n3. Compare estimated vs actual rows.\n4. Change indexes/query shape.\n5. Benchmark.\n6. Verify production-safe rollout.

## Failure modes

Avoid:

- optimizing from estimated cost only; forcing plans prematurely; ignoring data distribution.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
