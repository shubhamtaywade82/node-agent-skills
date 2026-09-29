---
name: node-error-budget-engineering
description: Use when release cadence or operational risk needs an error-budget policy.
---

# Error Budget Engineering

## Purpose

turning SLO measurements into explicit release and reliability decision inputs.

## Activate when

- release cadence or operational risk needs an error-budget policy.
- The change affects reliability, security, identity, or production operations.

## Repository inspection

1. Detect runtime, package manager, framework, observability stack, deployment model, and test commands.
2. Locate the existing owner of the behavior and its production contract.
3. Inspect configuration, dependency versions, CI, runbooks, and adjacent tests.
4. Verify exact library versions before using adapter-specific APIs.

## Decision rules

budgets quantify allowed unreliability; policy defines when to slow risky changes; a budget is not a binary health check

- Treat runtime data and external identity/provider responses as untrusted.
- Preserve security and data-integrity guarantees during failure handling.
- Make thresholds, ownership, and lifecycle semantics explicit.
- Prefer the smallest change that makes the contract measurable and testable.

## Implementation procedure

1. Calculate budget from SLO.
2. Define burn-rate windows.
3. Define policy thresholds.
4. Connect signals to release/runbook decisions.
5. Document exceptions.
6. Test alert logic.

## Failure modes

Avoid:

- blocking all deploys on single blips; ignoring long-window burn; treating budget as a substitute for incident response.
- Hidden operational ownership or implicit security assumptions.
- Tests that prove only implementation details.

## Verification

1. Add focused tests before behavior changes.
2. Exercise failure, replay, revocation, or operational recovery paths as applicable.
3. Run the repository test suite and all documented production gates.
4. Verify telemetry and runbook/operator behavior.
5. Record residual risk and rollback implications.
