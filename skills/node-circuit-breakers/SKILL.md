---
name: node-circuit-breakers
description: Use when designing or changing circuit breakers, retry budgets, fallback semantics, or cascading-failure isolation in a Node.js backend.
---

# Node Circuit Breakers

## Purpose

A circuit breaker is an explicit failure policy: a bounded mechanism that stops calling a failing downstream so the system can degrade gracefully instead of cascading. Without one, every downstream outage becomes a system-wide outage.

## Activate when

- A downstream service is failing slowly (timeouts, 5xx) and you need to stop hammering it.
- Adding a retry policy that must coordinate with a breaker (retry budget, error rate).
- Designing fallback behavior (cached response, degraded mode, explicit failure).
- Diagnosing cascading failures where one downstream's outage saturates the worker pool.
- Choosing a library (`opossum`, `cockatiel`) or rolling a custom breaker.

## Repository inspection

1. Breaker library — grep for `opossum`, `cockatiel`, `circuit-breaker`, `@opencensus/breaker`. Find the breaker config.
2. Retry policy — grep for `p-retry`, `Retry-After`, `maxAttempts`, `backoff`. Find the policy per downstream.
3. Timeouts — grep for `AbortSignal.timeout`, `setTimeout`. Find the per-call deadline.
4. Fallback — grep for `fallback`, `degraded`, `cache.get`. Find what the system does when the breaker is open.
5. Concurrency — grep for `p-limit`, `workerpool`, `maxConcurrent`. Find the bound per downstream.
6. Metrics — grep for `breaker.state`, `circuit_open_total`, `breaker_trip_count`. Find the observability.
7. Downstream inventory — list every external dependency (Stripe, SendGrid, Algolia, internal services).

## Decision rules

| Concern | Rule |
|---|---|
| Trip threshold | Open after N consecutive failures (typically 5) OR error-rate > threshold (typically 50% over a 1-minute window). |
| Cooldown | Stay open for a fixed duration (typically 30s) before half-open. |
| Half-open | Allow N (typically 1) test request; success → close, failure → reopen. |
| Retry budget | Retries + breaker are a coordinated policy. Breaker trips when retries exhaust. Do not retry while breaker is open. |
| Fallback | Cached response (with explicit freshness), degraded response (subset of features), or explicit failure. Never silent fallback to stale data. |
| Per-downstream | Each downstream has its own breaker. One Stripe outage does not open the SendGrid breaker. |
| Criticality | Fatal downstream = request fails when breaker open. Degraded = subset of features missing. Optional = invisible to user. |
| Concurrency | Breaker + bounded concurrency = isolation. Without the bound, one slow downstream consumes all workers. |
| Idempotency | Half-open test request must be idempotent (GET or POST with Idempotency-Key). |
| Observability | Breaker state, trip count, last error, half-open attempts must be metrics. Alerts on `breaker_open > 0` for fatal downstreams. |
| Timeout coordination | Per-call timeout < breaker cooldown. Otherwise the call holds the worker while the breaker is open. |
| Bulkhead | Combine with a worker pool per downstream so one downstream cannot exhaust the pool for others. |

## Implementation procedure

1. Inventory the downstreams. Classify each as fatal, degraded, or optional.
2. For each downstream, set: timeout (per-call), retry policy (attempts, backoff, retryable errors), breaker policy (threshold, cooldown, half-open).
3. Pick the fallback per downstream: cached response with freshness, degraded response, or explicit failure.
4. Bound concurrency per downstream: per-host pool or `p-limit` of the appropriate size.
5. Add observability: per-downstream latency histogram, error rate, breaker state, retry count, fallback engagement.
6. Wire the breaker into the call path: request → breaker → timeout → retry → fallback.
7. Test under failure: stub the downstream to fail; confirm breaker opens after threshold; confirm fallback engages; confirm half-open after cooldown.

## Failure modes

- Breaker trips on 4xx errors → validation errors look like downstream outage, breaker opens.
- No cooldown → breaker opens and closes immediately, hammering the failing downstream.
- Half-open allows many test requests → reopening happens late.
- Retry policy retries while breaker is open → defeats the purpose.
- Fallback serves stale data with no freshness signal → user thinks they see current data.
- No bulkhead → one slow downstream consumes all workers; other downstreams fail even though their breakers are closed.
- Per-process breaker with no shared state → each replica opens/closes independently; load on the downstream never drops.
- Breaker never trips because the threshold is too high → cascading failure anyway.
- Breaker trips but no alert → operator does not know the system is degraded.
- No idempotency on half-open test → if the test request succeeds downstream but the response is lost, the test counts as a failure.

## Verification

- Test happy path: breaker closed, downstream up, request succeeds.
- Test threshold: stub N consecutive failures; confirm breaker opens.
- Test cooldown: breaker opens; wait for cooldown; confirm half-open.
- Test half-open success: half-open call succeeds; confirm breaker closes.
- Test half-open failure: half-open call fails; confirm breaker reopens.
- Test fallback: breaker open; confirm fallback response with explicit signal.
- Test concurrency: stub slow downstream; confirm only N workers are blocked; other downstreams still serve.
- Test observability: confirm breaker state, trip count, fallback engagement are visible as metrics.
- Source references: https://github.com/nickuraltsev/opossum, https://cockatiel.rogs.me/, https://martinfowler.com/bliki/CircuitBreaker.html, https://aws.amazon.com/builders-library/avoiding-overload-with-circuit-breakers/, https://reactivex.io/documentation/operators/circuitbreaker.html.
