---
name: node-time-engineering
description: Use when timestamps, expirations, recurring jobs, windows, SLAs, or date calculations are involved.
---

# Time Engineering

## Purpose

making time-dependent backend behavior deterministic across timezones, clocks, and scheduling.

## Activate when

- timestamps, expirations, recurring jobs, windows, SLAs, or date calculations are involved.
- The change affects operational continuity, resource safety, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, deployment topology, persistence, queues, observability, and CI.
2. Locate current resource/state ownership and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.

## Decision rules

store instants and timezone intent distinctly; avoid local wall-clock assumptions; inject clocks where determinism matters; define DST behavior

- Budgets, thresholds, ownership, and abort/rollback conditions are explicit.
- Security and integrity controls remain intact during degraded operation.
- Prefer deterministic, bounded recovery and test behavior.

## Implementation procedure

1. Identify instant vs calendar concept.
2. Choose representation.
3. Define timezone source.
4. Inject clock.
5. Handle DST boundaries.
6. Test date transitions.

## Failure modes

Avoid:

- using server local time; string comparisons; ambiguous timezone conversions; tests dependent on current wall clock.
- Hidden dependencies or unbounded recovery work.
- Happy-path-only tests.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify telemetry exposes the transition and outcome.
5. Record residual risk and operator actions.
