---
name: node-observability-validation
description: Use when logs, metrics, traces, alerts, dashboards, or release gates are being added or changed.
---

# Observability Validation

## Purpose

proving that backend telemetry actually supports detection, diagnosis, and SLO measurement.

## Activate when

- logs, metrics, traces, alerts, dashboards, or release gates are being added or changed.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

telemetry is tested for presence, correctness, cardinality, redaction, and correlation; alert rules map to operator action

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Define signals and expected semantics.
2. Instrument boundaries.
3. Test representative success/failure paths.
4. Validate metric labels.
5. Verify trace context and log correlation.
6. Check redaction.

## Failure modes

Avoid:

- telemetry that never fires; high-cardinality labels; alerts without runbooks; tracing without propagation; secrets in diagnostics.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
