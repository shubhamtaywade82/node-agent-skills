---
name: node-auth-session-revocation
description: Use when logout-all, password reset, compromise response, admin revocation, or device removal is implemented.
---

# Session Revocation

## Purpose

invalidating authenticated sessions/tokens when credentials, devices, or user state change.

## Activate when

- logout-all, password reset, compromise response, admin revocation, or device removal is implemented.
- The change affects reliability, security, identity, or production operations.

## Repository inspection

1. Detect runtime, package manager, framework, observability stack, deployment model, and test commands.
2. Locate the existing owner of the behavior and its production contract.
3. Inspect configuration, dependency versions, CI, runbooks, and adjacent tests.
4. Verify exact library versions before using adapter-specific APIs.

## Decision rules

revocation must have durable server-side semantics when stateless tokens cannot be individually revoked; caches cannot become the sole source of authority

- Treat runtime data and external identity/provider responses as untrusted.
- Preserve security and data-integrity guarantees during failure handling.
- Make thresholds, ownership, and lifecycle semantics explicit.
- Prefer the smallest change that makes the contract measurable and testable.

## Implementation procedure

1. Define session identity/version.
2. Choose server-side revocation or token-version strategy.
3. Propagate across regions/caches.
4. Expire safely.
5. Test concurrent requests and replay.

## Failure modes

Avoid:

- client-only logout; revocation state only in memory; stale replica acceptance; replay after password reset.
- Hidden operational ownership or implicit security assumptions.
- Tests that prove only implementation details.

## Verification

1. Add focused tests before behavior changes.
2. Exercise failure, replay, revocation, or operational recovery paths as applicable.
3. Run the repository test suite and all documented production gates.
4. Verify telemetry and runbook/operator behavior.
5. Record residual risk and rollback implications.
