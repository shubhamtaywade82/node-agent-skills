---
name: node-security-incident-response
description: Use when a credential leak, suspicious access, exploit, or data-security event is detected.
---

# Security Incident Response

## Purpose

handling backend security incidents with containment, evidence preservation, eradication, and recovery.

## Activate when

- a credential leak, suspicious access, exploit, or data-security event is detected.
- The change affects reliability, security, identity, or production operations.

## Repository inspection

1. Detect runtime, package manager, framework, observability stack, deployment model, and test commands.
2. Locate the existing owner of the behavior and its production contract.
3. Inspect configuration, dependency versions, CI, runbooks, and adjacent tests.
4. Verify exact library versions before using adapter-specific APIs.

## Decision rules

preserve evidence before destructive changes; contain least-disruptively; rotate/revoke compromised credentials; scope impact; communicate based on facts

- Treat runtime data and external identity/provider responses as untrusted.
- Preserve security and data-integrity guarantees during failure handling.
- Make thresholds, ownership, and lifecycle semantics explicit.
- Prefer the smallest change that makes the contract measurable and testable.

## Implementation procedure

1. Classify incident.
2. Preserve logs/evidence.
3. Contain affected paths.
4. Revoke/rotate secrets.
5. Identify affected data.
6. Patch/mitigate.
7. Verify recovery.
8. Document timeline.

## Failure modes

Avoid:

- deleting logs; rotating without preserving scope; speculative attribution; exposing sensitive incident details in ordinary logs.
- Hidden operational ownership or implicit security assumptions.
- Tests that prove only implementation details.

## Verification

1. Add focused tests before behavior changes.
2. Exercise failure, replay, revocation, or operational recovery paths as applicable.
3. Run the repository test suite and all documented production gates.
4. Verify telemetry and runbook/operator behavior.
5. Record residual risk and rollback implications.
