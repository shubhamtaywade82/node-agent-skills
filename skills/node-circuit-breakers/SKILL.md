---
name: node-circuit-breakers
description: Use when protecting a Node.js service from repeatedly failing or slow dependencies with explicit open, half-open, and closed circuit behavior.
---

# Circuit Breakers

## Purpose
A circuit breaker prevents repeated dependency attempts from consuming local capacity after a failure threshold is reached. It does not replace timeouts or idempotency.

## Activate when
- Dependency failures repeatedly consume request capacity.
- A degraded dependency needs temporary admission control.
- Recovery probing must be bounded.

## Repository inspection
Inspect dependency timeout, failure classification, breaker scope, state storage, half-open probe policy, fallback, and metrics.

## Decision rules
| Concern | Rule |
|---|---|
| Timeout | Establish bounded timeouts before breaker logic. |
| Failure classification | Count meaningful dependency failures, not caller validation errors. |
| Scope | Scope breaker state to the dependency/resource whose failure is being protected. |
| Open state | Reject or degrade quickly while the dependency is unhealthy. |
| Half-open | Permit a small bounded number of probes; prevent a recovery stampede. |
| State | Use distributed state only when the protection goal actually spans processes. |
| Recovery | Require evidence of successful dependency health before fully closing. |

## Implementation procedure
1. Define the protected dependency and failure signals.
2. Configure timeout and breaker thresholds from measured behavior.
3. Implement closed/open/half-open transitions.
4. Add bounded recovery probes.
5. Define fallback or explicit failure response.
6. Emit state-transition and rejection telemetry.

## Failure modes
- Breaker counts application validation errors as dependency failures.
- Half-open state allows every request to probe simultaneously.
- Breaker opens without a timeout, allowing requests to remain stuck.
- One global breaker couples unrelated tenants or dependency endpoints.
- Breaker stays open after recovery because success criteria are undefined.

## Verification
Test normal operation, transient failure, sustained failure, slow responses, half-open recovery, probe concurrency, and telemetry.
