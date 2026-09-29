---
name: node-security-headers
description: Use when backend responses are served to browsers or embedded web clients.
---

# Security Headers

## Purpose

hardening HTTP responses with appropriate browser-facing security headers.

## Activate when

- backend responses are served to browsers or embedded web clients.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

headers are policy controls with context-specific trade-offs; CSP, HSTS, frame protections, content sniffing, and referrer policy are deliberate

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Classify browser exposure.
2. Choose headers supported by deployment.
3. Configure per environment.
4. Test response policy.
5. Document exceptions.

## Failure modes

Avoid:

- blindly copying headers; enabling HSTS before HTTPS readiness; CSP that breaks required assets without rollout; duplicate/conflicting policies.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
