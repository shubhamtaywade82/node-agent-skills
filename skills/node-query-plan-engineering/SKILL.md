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

- Query-plan changes must be evaluated with real EXPLAIN evidence.
- Plan improvements must preserve correctness, parameterization, and tenant/security predicates.
- Index changes need workload and selectivity evidence, not one synthetic query.
- Production plan regressions require a rollback or mitigation path.

## Implementation procedure

1. Capture the current query and baseline EXPLAIN plan.
2. Inspect cardinality, selectivity, indexes, and statistics.
3. Test the proposed plan with representative parameters.
4. Measure latency and resource impact.
5. Preserve a regression fixture or operational verification query.

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
