---
name: node-progressive-delivery
description: Use when canary, blue-green, percentage rollout, or tenant-based deployment is used.
---

# Progressive Delivery

## Purpose

rolling out backend changes safely through staged exposure and automated rollback signals.

## Activate when

- canary, blue-green, percentage rollout, or tenant-based deployment is used.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

rollout stages are explicit; health/SLO signals gate promotion; rollback/roll-forward is defined; schema compatibility survives mixed versions

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Define cohorts.
2. Instrument release health.
3. Establish promotion thresholds.
4. Coordinate feature flags and schema rollout.
5. Automate or document rollback.

## Failure modes

Avoid:

- promoting on deployment success alone; irreversible migrations before rollout; unclear cohort ownership; rollback that cannot work with mixed schema.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
