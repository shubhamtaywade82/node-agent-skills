---
name: node-chaos-engineering
description: Use when resilience, dependency failure, overload, process loss, or network faults need evidence.
---

# Chaos Engineering

## Purpose

testing backend failure assumptions through controlled experiments.

## Activate when

- resilience, dependency failure, overload, process loss, or network faults need evidence.
- The change affects operational continuity, safety margins, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, package manager, deployment topology, persistence, queues, observability, and CI.
2. Locate current state ownership, configuration, and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.
4. Identify which behavior is critical and which may safely degrade.

## Decision rules

experiments are hypothesis-driven, bounded, observable, and reversible; never attack production without explicit safety controls

- Recovery and failover procedures must be executable and observable.
- Do not weaken security or data integrity under failure.
- Make budgets, thresholds, ownership, and rollback/abort conditions explicit.
- Prefer deterministic tests and controlled exercises over assumptions.

## Implementation procedure

1. State steady-state behavior.
2. Choose one failure mode.
3. Define blast radius and abort conditions.
4. Inject fault.
5. Observe SLOs.
6. Remediate.
7. Repeat safely.

## Failure modes

Avoid:

- random failure injection; no abort condition; experiments without telemetry; using chaos to replace ordinary integration tests.
- Hidden operational dependencies or unbounded recovery work.
- Tests that validate only the happy path.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify observability exposes the transition and outcome.
5. Record residual risk and operator actions.
