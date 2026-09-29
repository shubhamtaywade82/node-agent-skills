---
name: node-cost-aware-engineering
description: Use when cloud spend, database cost, egress, storage, or compute utilization materially affects design.
---

# Cost-Aware Backend Engineering

## Purpose

making infrastructure cost a design constraint without sacrificing required correctness or SLOs.

## Activate when

- cloud spend, database cost, egress, storage, or compute utilization materially affects design.
- The change affects operational continuity, resource safety, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, deployment topology, persistence, queues, observability, and CI.
2. Locate current resource/state ownership and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.

## Decision rules

cost drivers are explicit; optimize unit cost per useful workload; do not trade away security/reliability blindly

- Budgets, thresholds, ownership, and abort/rollback conditions are explicit.
- Security and integrity controls remain intact during degraded operation.
- Prefer deterministic, bounded recovery and test behavior.

## Implementation procedure

1. Identify dominant cost dimensions.
2. Calculate unit economics.
3. Compare architecture options.
4. Reduce waste.
5. Add budgets/alerts.
6. Verify performance and reliability.

## Failure modes

Avoid:

- premature micro-optimization; ignoring egress/storage costs; removing safety controls to save cost.
- Hidden dependencies or unbounded recovery work.
- Happy-path-only tests.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify telemetry exposes the transition and outcome.
5. Record residual risk and operator actions.
