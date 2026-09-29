---
name: node-failover-engineering
description: Use when a database, cache, broker, region, or external dependency may become unavailable.
---

# Failover Engineering

## Purpose

making service and dependency failover deterministic and observable.

## Activate when

- a database, cache, broker, region, or external dependency may become unavailable.
- The change affects operational continuity, resource safety, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, deployment topology, persistence, queues, observability, and CI.
2. Locate current resource/state ownership and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.

## Decision rules

failover is a state transition with detection, decision, traffic movement, and recovery verification

- Budgets, thresholds, ownership, and abort/rollback conditions are explicit.
- Security and integrity controls remain intact during degraded operation.
- Prefer deterministic, bounded recovery and test behavior.

## Implementation procedure

1. Define detection signal.
2. Establish thresholds.
3. Specify routing/election.
4. Test read/write behavior during failover.
5. Verify recovery.
6. Prevent split-brain.

## Failure modes

Avoid:

- manual failover with hidden steps; flapping thresholds; split-brain; routing changed without consistency checks.
- Hidden dependencies or unbounded recovery work.
- Happy-path-only tests.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify telemetry exposes the transition and outcome.
5. Record residual risk and operator actions.
