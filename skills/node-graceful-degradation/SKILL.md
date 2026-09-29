---
name: node-graceful-degradation
description: Use when a feature depends on optional data, cache, recommendation, analytics, or secondary service.
---

# Graceful Degradation

## Purpose

preserving critical backend behavior when non-critical dependencies fail.

## Activate when

- a feature depends on optional data, cache, recommendation, analytics, or secondary service.
- The change affects operational continuity, resource safety, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, deployment topology, persistence, queues, observability, and CI.
2. Locate current resource/state ownership and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.

## Decision rules

degrade only where semantics permit; never silently weaken authorization or data integrity; fallback behavior is observable

- Budgets, thresholds, ownership, and abort/rollback conditions are explicit.
- Security and integrity controls remain intact during degraded operation.
- Prefer deterministic, bounded recovery and test behavior.

## Implementation procedure

1. Classify critical vs optional dependencies.
2. Define fallback semantics.
3. Bound fallback work.
4. Expose degradation telemetry.
5. Test dependency failure.

## Failure modes

Avoid:

- returning stale security decisions; swallowing payment/data-integrity failures; fallback loops.
- Hidden dependencies or unbounded recovery work.
- Happy-path-only tests.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify telemetry exposes the transition and outcome.
5. Record residual risk and operator actions.
