---
name: node-resilience
description: Use when designing service resilience across dependency failures, latency spikes, retries, fallbacks, degradation, or capacity exhaustion.
---

# Resilience Engineering

## Purpose
Resilience is a system of explicit failure policies: deadlines, bounded concurrency, load control, safe degradation, and observability.

## Activate when
- A dependency becomes slow or unavailable.
- A service needs graceful degradation.
- Multiple resilience mechanisms are being combined.

## Repository inspection
Map dependency graph, criticality, timeout/retry policies, capacity limits, fallback data, error budgets, and telemetry before changing behavior.

## Decision rules
| Concern | Rule |
|---|---|
| Dependency criticality | Classify failures as fatal, degraded, or optional per business capability. |
| Budget | Set bounded latency, concurrency, queue, retry, and memory budgets. |
| Fallback | Fallbacks must have explicit freshness and correctness semantics. |
| Retry | Never add retries without an eligibility/idempotency decision. |
| Isolation | Separate capacity between unrelated or high-priority workloads when a shared dependency can exhaust it. |
| Observability | Emit enough evidence to distinguish rejection, timeout, dependency failure, and application failure. |

## Implementation procedure
1. Define the capability that must remain available.
2. Identify the dependency whose failure threatens it.
3. Set deadline, concurrency, queue, and retry budgets.
4. Add only the resilience mechanisms needed for the failure mode.
5. Define degraded behavior and operator signals.
6. Exercise the design under partial failure and recovery.

## Failure modes
- Fallback silently serves data that is too stale.
- Circuit breaker hides an underlying saturation problem.
- Retry plus queue creates a feedback loop.
- Shared worker pool lets one dependency consume all capacity.
- Resilience logic has no metrics and cannot be diagnosed.

## Verification
Use failure injection to test dependency outage, latency, recovery, capacity exhaustion, fallback correctness, and observability.
