---
name: node-disaster-recovery
description: Use when a service needs RTO/RPO, regional recovery, dependency recovery, or documented restoration procedures.
---

# Disaster Recovery

## Purpose

designing recovery objectives and procedures for Node.js services and their dependencies.

## Activate when

- a service needs RTO/RPO, regional recovery, dependency recovery, or documented restoration procedures.
- The change affects operational continuity, safety margins, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, package manager, deployment topology, persistence, queues, observability, and CI.
2. Locate current state ownership, configuration, and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.
4. Identify which behavior is critical and which may safely degrade.

## Decision rules

recovery is an executable operational capability; identify authoritative data; distinguish rebuildable from irrecoverable state; test the recovery path

- Recovery and failover procedures must be executable and observable.
- Do not weaken security or data integrity under failure.
- Make budgets, thresholds, ownership, and rollback/abort conditions explicit.
- Prefer deterministic tests and controlled exercises over assumptions.

## Implementation procedure

1. Define service criticality.
2. Set RTO/RPO.
3. Map dependencies and recovery order.
4. Identify backups/rebuild paths.
5. Automate restoration checks.
6. Document operator actions.
7. Run recovery exercises.

## Failure modes

Avoid:

- assuming replicas equal backups; untested restore procedures; missing dependency ordering; recovery requiring unavailable credentials.
- Hidden operational dependencies or unbounded recovery work.
- Tests that validate only the happy path.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify observability exposes the transition and outcome.
5. Record residual risk and operator actions.
