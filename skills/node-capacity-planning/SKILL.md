---
name: node-capacity-planning
description: Use when traffic, data volume, queue depth, or resource saturation is growing.
---

# Capacity Planning

## Purpose

forecasting backend resource needs from workload, limits, and SLOs.

## Activate when

- traffic, data volume, queue depth, or resource saturation is growing.
- The change affects operational continuity, safety margins, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, package manager, deployment topology, persistence, queues, observability, and CI.
2. Locate current state ownership, configuration, and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.
4. Identify which behavior is critical and which may safely degrade.

## Decision rules

capacity is measured against real bottlenecks and safety margins; model replicas/workers/DB connections together

- Recovery and failover procedures must be executable and observable.
- Do not weaken security or data integrity under failure.
- Make budgets, thresholds, ownership, and rollback/abort conditions explicit.
- Prefer deterministic tests and controlled exercises over assumptions.

## Implementation procedure

1. Measure current workload.
2. Identify bottlenecks.
3. Model growth and peak factors.
4. Calculate resource budgets.
5. Define scaling triggers.
6. Validate with load tests.

## Failure modes

Avoid:

- projecting from CPU alone; ignoring DB connection limits; sizing for averages only; no headroom or failure capacity.
- Hidden operational dependencies or unbounded recovery work.
- Tests that validate only the happy path.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify observability exposes the transition and outcome.
5. Record residual risk and operator actions.
