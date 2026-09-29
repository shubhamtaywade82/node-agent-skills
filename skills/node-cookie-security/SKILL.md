---
name: node-cookie-security
description: Use when sessions, refresh tokens, CSRF tokens, or security-sensitive state are stored in cookies.
---

# Cookie Security

## Purpose

using HTTP cookies safely for authenticated backend state.

## Activate when

- sessions, refresh tokens, CSRF tokens, or security-sensitive state are stored in cookies.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

Secure, HttpOnly, SameSite, Path/Domain, and lifetime are deliberate; CSRF protection is separate; cookie scope is minimized

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Classify cookie purpose.
2. Choose flags.
3. Constrain domain/path.
4. Define SameSite behavior.
5. Pair state-changing requests with CSRF defenses where needed.
6. Test cross-site behavior.

## Failure modes

Avoid:

- session cookies accessible to JavaScript; overly broad Domain/Path; assuming SameSite eliminates every CSRF scenario; insecure development flags leaking to production.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
