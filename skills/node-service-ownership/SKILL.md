---
name: node-service-ownership
description: Use when a backend service has unclear maintainers, dependency owners, or operational escalation.
---

# Backend Service Ownership

## Purpose

making service ownership, dependencies, escalation, and operational responsibility explicit.

## Activate when

- a backend service has unclear maintainers, dependency owners, or operational escalation.
- The change affects reliability, security, identity, or production operations.

## Repository inspection

1. Detect runtime, package manager, framework, observability stack, deployment model, and test commands.
2. Locate the existing owner of the behavior and its production contract.
3. Inspect configuration, dependency versions, CI, runbooks, and adjacent tests.
4. Verify exact library versions before using adapter-specific APIs.

## Decision rules

ownership is about accountable humans/teams and durable metadata; every critical dependency has a fallback escalation path

- Treat runtime data and external identity/provider responses as untrusted.
- Preserve security and data-integrity guarantees during failure handling.
- Make thresholds, ownership, and lifecycle semantics explicit.
- Prefer the smallest change that makes the contract measurable and testable.

## Implementation procedure

1. Identify service owner.
2. Map dependencies.
3. Define escalation and support windows.
4. Attach runbook/SLO links.
5. Keep metadata versioned.
6. Verify ownership in delivery tooling.

## Failure modes

Avoid:

- orphaned services; owner listed only in chat; stale escalation contacts; dependency without accountable owner.
- Hidden operational ownership or implicit security assumptions.
- Tests that prove only implementation details.

## Verification

1. Add focused tests before behavior changes.
2. Exercise failure, replay, revocation, or operational recovery paths as applicable.
3. Run the repository test suite and all documented production gates.
4. Verify telemetry and runbook/operator behavior.
5. Record residual risk and rollback implications.
