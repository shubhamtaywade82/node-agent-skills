---
name: node-multi-region
description: Use when availability, latency, residency, or disaster recovery requires multiple regions.
---

# Multi-Region Services

## Purpose

designing Node.js services for more than one active or standby region.

## Activate when

- availability, latency, residency, or disaster recovery requires multiple regions.
- The change affects operational continuity, resource safety, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, deployment topology, persistence, queues, observability, and CI.
2. Locate current resource/state ownership and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.

## Decision rules

region topology, data ownership, consistency, failover, and DNS/routing are explicit; avoid accidental active-active conflicts

- Budgets, thresholds, ownership, and abort/rollback conditions are explicit.
- Security and integrity controls remain intact during degraded operation.
- Prefer deterministic, bounded recovery and test behavior.

## Implementation procedure

1. Define region roles.
2. Classify state.
3. Choose replication model.
4. Make writes/failover explicit.
5. Handle region-local dependencies.
6. Exercise failover.
7. Document return-to-service.

## Failure modes

Avoid:

- active-active without conflict strategy; globally shared mutable state; failover with stale config; no return-path test.
- Hidden dependencies or unbounded recovery work.
- Happy-path-only tests.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify telemetry exposes the transition and outcome.
5. Record residual risk and operator actions.
