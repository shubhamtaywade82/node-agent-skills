---
name: node-infrastructure-as-code
description: Use when cloud, Kubernetes, networking, databases, or supporting resources are provisioned through IaC.
---

# Infrastructure as Code

## Purpose

managing backend infrastructure declaratively with reviewable and reproducible configuration.

## Activate when

- cloud, Kubernetes, networking, databases, or supporting resources are provisioned through IaC.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

desired state is versioned; secrets are externalized; plans are reviewed; state locking/ownership is explicit; drift is detectable

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Identify IaC tool and state backend.
2. Define module/resource ownership.
3. Parameterize environments.
4. Run plan/validation.
5. Protect state.
6. Apply through controlled pipeline.
7. Verify drift.

## Failure modes

Avoid:

- editing production manually then encoding later; secrets in state/config; unreviewed applies; shared state without locking.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
