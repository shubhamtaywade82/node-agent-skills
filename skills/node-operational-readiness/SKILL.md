---
name: node-operational-readiness
description: Use when a feature, service, migration, or dependency is approaching production.
---

# Operational Readiness

## Purpose

checking production readiness before a backend feature or service is released.

## Activate when

- a feature, service, migration, or dependency is approaching production.
- The change affects reliability, security, identity, or production operations.

## Repository inspection

1. Detect runtime, package manager, framework, observability stack, deployment model, and test commands.
2. Locate the existing owner of the behavior and its production contract.
3. Inspect configuration, dependency versions, CI, runbooks, and adjacent tests.
4. Verify exact library versions before using adapter-specific APIs.

## Decision rules

readiness covers reliability, observability, security, capacity, rollback, ownership, and recovery evidence

- Treat runtime data and external identity/provider responses as untrusted.
- Preserve security and data-integrity guarantees during failure handling.
- Make thresholds, ownership, and lifecycle semantics explicit.
- Prefer the smallest change that makes the contract measurable and testable.

## Implementation procedure

1. Review contract.
2. Confirm health/readiness.
3. Verify dashboards/alerts.
4. Check capacity and dependency budgets.
5. Verify backup/recovery.
6. Exercise rollback.
7. Capture owner sign-off.

## Failure modes

Avoid:

- production launch without rollback; missing telemetry; unverified secrets/config; relying on local tests for operational readiness.
- Hidden operational ownership or implicit security assumptions.
- Tests that prove only implementation details.

## Verification

1. Add focused tests before behavior changes.
2. Exercise failure, replay, revocation, or operational recovery paths as applicable.
3. Run the repository test suite and all documented production gates.
4. Verify telemetry and runbook/operator behavior.
5. Record residual risk and rollback implications.
