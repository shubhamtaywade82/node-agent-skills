---
name: node-oncall-readiness
description: Use when a service is entering production or changing enough to affect incident response.
---

# On-Call Readiness

## Purpose

preparing Node.js services for safe human operation during incidents.

## Activate when

- a service is entering production or changing enough to affect incident response.
- The change affects reliability, security, identity, or production operations.

## Repository inspection

1. Detect runtime, package manager, framework, observability stack, deployment model, and test commands.
2. Locate the existing owner of the behavior and its production contract.
3. Inspect configuration, dependency versions, CI, runbooks, and adjacent tests.
4. Verify exact library versions before using adapter-specific APIs.

## Decision rules

on-call needs actionable alerts, runbooks, dashboards, safe mitigations, and known failure modes; alerts must be tied to user impact

- Treat runtime data and external identity/provider responses as untrusted.
- Preserve security and data-integrity guarantees during failure handling.
- Make thresholds, ownership, and lifecycle semantics explicit.
- Prefer the smallest change that makes the contract measurable and testable.

## Implementation procedure

1. Review SLOs.
2. Verify actionable alerts.
3. Link dashboards/runbooks.
4. Document safe mitigations.
5. Rehearse top failure modes.
6. Remove noisy alerts.
7. Audit access.

## Failure modes

Avoid:

- alerts without actions; runbooks missing commands; unsafe manual remediation; paging on symptoms with no user impact.
- Hidden operational ownership or implicit security assumptions.
- Tests that prove only implementation details.

## Verification

1. Add focused tests before behavior changes.
2. Exercise failure, replay, revocation, or operational recovery paths as applicable.
3. Run the repository test suite and all documented production gates.
4. Verify telemetry and runbook/operator behavior.
5. Record residual risk and rollback implications.
