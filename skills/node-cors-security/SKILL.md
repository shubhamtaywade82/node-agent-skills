---
name: node-cors-security
description: Use when a browser client from another origin accesses the backend.
---

# CORS Security

## Purpose

configuring cross-origin API access without turning CORS into an authentication mechanism.

## Activate when

- a browser client from another origin accesses the backend.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

allowed origins are explicit; credentials and wildcard rules are compatible; preflight behavior is predictable; CORS never grants authorization

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Identify browser origins.
2. Define credential policy.
3. Configure allowlists.
4. Validate Origin.
5. Handle preflight.
6. Test allowed/disallowed origins and headers.

## Failure modes

Avoid:

- reflecting arbitrary Origin; wildcard plus credentials; treating CORS as authorization; forgetting non-simple request preflight.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
