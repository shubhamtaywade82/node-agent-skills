---
name: node-session-management
description: Use when browser or API authentication uses server-side or refreshable sessions.
---

# Session Management

## Purpose

designing backend sessions with explicit lifetime, revocation, rotation, and storage semantics.

## Activate when

- browser or API authentication uses server-side or refreshable sessions.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

session identifiers are opaque; server-side state is protected; rotation/revocation are explicit; idle and absolute expiry are distinct

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Define session record.
2. Use random identifiers.
3. Set idle/absolute TTL.
4. Rotate after privilege changes.
5. Revoke on logout/risk events.
6. Bound concurrent sessions.
7. Audit lifecycle.

## Failure modes

Avoid:

- encoding identity in predictable IDs; indefinite sessions; storing raw tokens in logs; revocation that only updates client state.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
