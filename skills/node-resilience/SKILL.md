---
name: node-resilience
description: Use when designing Node.js service resilience across dependency failures, latency spikes, retries, fallbacks, degradation, or capacity exhaustion.
---

# Node Resilience Engineering

## Purpose

Resilience is a system of explicit failure policies: deadlines, bounded concurrency, load control, safe degradation, and observability. Each mechanism has a budget; combining mechanisms without coordination produces feedback loops.

## Activate when

- A dependency becomes slow or unavailable.
- A service needs graceful degradation (cached fallback, partial response, rate-limited mode).
- Multiple resilience mechanisms are being combined (retry + circuit breaker + timeout + queue).
- Capacity exhaustion is the failure mode (memory, connection pool, worker pool).
- Designing bulkheads (per-tenant, per-downstream, per-feature) for isolation.

## Repository inspection

1. Dependency graph — list every external service the system calls. Classify each as fatal, degraded, or optional.
2. Timeout policy — grep for `AbortSignal.timeout`, `setTimeout`, `connectionTimeout`. Find the per-call and per-request deadlines.
3. Retry policy — grep for `p-retry`, `Retry-After`, `maxAttempts`. Find the policy per downstream.
4. Breaker — grep for `opossum`, `cockatiel`, `breaker`. Find the breaker per downstream.
5. Concurrency — grep for `p-limit`, `workerpool`, `maxConcurrent`. Find the bound per downstream.
6. Fallback — grep for `fallback`, `degraded`, `cache.get`. Find what the system does on failure.
7. Capacity — read pool sizes (DB `max`, HTTP `connections`, queue `concurrency`).
8. Budget — grep for `error_budget`, `slo_window`, `burn_rate`. Find the SLO-based policy.
9. Observability — grep for `latency_histogram`, `error_rate`, `breaker_state`. Find the resilience telemetry.

## Decision rules

| Concern | Rule |
|---|---|
| Dependency criticality | Classify failures as fatal, degraded, or optional per business capability. |
| Budget | Set bounded latency, concurrency, queue, retry, and memory budgets. Each is a number, not "as much as possible." |
| Fallback | Fallbacks must have explicit freshness and correctness semantics. Cached fallback says "stale as of X." Degraded fallback says "subset of features." Never silent fallback to stale data. |
| Retry | Never add retries without an eligibility/idempotency decision. Retry only idempotent operations. Bound attempts ≤ 5. |
| Timeout | One end-to-end deadline per request. Derive child deadlines from it; never invent new ones downstream. |
| Breaker | Open after N failures or error-rate > threshold. Stay open for a cooldown. Half-open to test recovery. |
| Isolation | Separate capacity between unrelated or high-priority workloads when a shared dependency can exhaust it (bulkheads). |
| Backpressure | Streaming pipelines must propagate pressure. Queue depth must be bounded; overflow is a 429 or 503, not silent growth. |
| Load shedding | When at capacity, reject new work with 503 + `Retry-After`. Do not degrade existing requests to accept new ones. |
| Graceful degradation | The system continues serving core capabilities when a non-critical dependency fails. Document what degrades. |
| Observability | Emit enough evidence to distinguish rejection (429/503), timeout (408/504), dependency failure (502/503), and application failure (500). |
| Combining mechanisms | Retry + breaker + timeout + queue must be coordinated. Retry exhausts → breaker trips. Queue depth high → load shedding engages. |
| Chaos testing | Test resilience under partial failure (kill a downstream, slow a DB, fill a queue) before relying on it. |

## Implementation procedure

1. Define the capability that must remain available (e.g., "users can place orders even if the recommendations service is down").
2. Identify the dependency whose failure threatens it (e.g., recommendations service).
3. Set deadlines: per-call ≤ 2s, per-request ≤ 5s. Document the numbers.
4. Set concurrency: per-downstream pool size ≤ rate limit / 10. Document the number.
5. Set retry: attempts ≤ 5, exponential + jitter, retryable errors (5xx, 429, network). Document the policy.
6. Set breaker: open after 5 consecutive failures, cooldown 30s, half-open 1 attempt. Document.
7. Set fallback: cached response with freshness ≤ 5min, or degraded response with explicit "subset" signal. Document.
8. Set load shedding: queue depth > 100 → 503 with `Retry-After: 1`. Document.
9. Exercise the design under partial failure: kill the downstream; confirm breaker opens, fallback engages, request completes; confirm load shedding engages when the queue fills.

## Failure modes

- Fallback silently serves data that is too stale → user makes decisions on stale data.
- Circuit breaker hides an underlying saturation problem → breaker oscillates, root cause never addressed.
- Retry plus queue creates a feedback loop → queue grows, retries add load, downstream never recovers.
- Shared worker pool lets one dependency consume all capacity → other downstreams fail even though they're healthy.
- Resilience logic has no metrics and cannot be diagnosed → operator sees "intermittent 5xx" with no clue which mechanism is the cause.
- Timeouts set but not propagated → downstream work continues after the parent request timed out, wasting resources.
- Breaker opens but no alert → operator does not know the system is degraded until users complain.
- Retries on 4xx (non-retryable) → amplifies a validation error into a downstream DoS.
- Load shedding at 100% capacity → too late; existing requests are already degraded.
- Retry without idempotency → double-charges, double-emails, double-state-transitions.
- Bulkhead sized too small → one tenant's traffic consumes its whole pool, even when other pools are idle.
- Graceful degradation that fails silently → user thinks all features work, only some do.

## Verification

- Use failure injection to test dependency outage: stop the downstream; confirm breaker opens; confirm fallback engages; confirm request completes (or fails clearly).
- Test latency: slow the downstream to 5s; confirm timeout engages; confirm fallback or load shedding.
- Test capacity: fill the queue; confirm 503 with `Retry-After`; confirm existing requests still complete.
- Test recovery: restore the downstream; confirm breaker closes; confirm normal behavior resumes.
- Test fallback freshness: trigger fallback; confirm response includes `X-Stale: <timestamp>`.
- Test fallback correctness: trigger fallback; confirm the subset of features is explicit, not silent.
- Inspect metrics: confirm latency p50/p95/p99, error rate, breaker state, queue depth, retry count are visible.
- Run a chaos experiment: kill a downstream mid-load; confirm the system degrades as designed, not catastrophically.
- Source references: https://aws.amazon.com/builders-library/, https://sre.google/sre-book/handling-overload/, https://netflixtechblog.com/introducing-chaos-engineering-b5741c43c038, https://github.com/Netflix/Hystrix/wiki/How-it-Works, https://opentelemetry.io/docs/specs/semconv/.
