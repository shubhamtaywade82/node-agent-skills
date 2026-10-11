---
name: node-external-integrations
description: Use when designing or changing Node.js third-party API clients, outbound HTTP, webhook delivery, retries, timeouts, or external service dependencies.
---

# Node External Integrations

## Purpose

External services are unreliable by default. Treat them as failure-prone: bounded timeouts, explicit retries with idempotency, circuit breakers, and observability that distinguishes "we failed" from "they failed."

## Activate when

- Adding or changing an outbound HTTP client (Stripe, SendGrid, Resend, Twilio, Algolia, GitHub, internal services).
- Implementing outbound webhook delivery.
- Adding retry, backoff, circuit breaker, or fallback to a downstream call.
- Diagnosing slow external calls, cascading failures, or rate-limit exhaustion.
- Adding timeouts, deadlines, or concurrency limits to a downstream.

## Repository inspection

1. HTTP client — grep for `undici`, `fetch`, `axios`, `got`, `ky`, `node-fetch`. Read the version and the pool/dispatcher config.
2. External SDKs — grep for `stripe`, `@sendgrid/mail`, `resend`, `twilio`, `algoliasearch`, `@octokit/rest`. Read their versions.
3. Retry config — grep for `p-retry`, `@octokit/plugin-retry`, `axios-retry`, `Retry-After`. Find the retry policy per downstream.
4. Circuit breaker — grep for `opossum`, `cockatiel`, `circuit-breaker`. Find the breaker policy.
5. Timeouts — grep for `signal: AbortSignal.timeout`, `timeout:`, `requestTimeout`. Find the per-call deadline.
6. Webhook delivery — grep for `outbox`, `outbound webhook`, `webhook.delivery`. Find the publisher and the relay.
7. Idempotency keys — grep for `Idempotency-Key`. Find the per-downstream idempotency mechanism.

## Decision rules

| Concern | Rule |
|---|---|
| Timeouts | Every outbound call has an explicit deadline. Default ≤ 5s for fast APIs, ≤ 30s for slow. Never infinite. |
| Retries | Retry only idempotent operations (GET, idempotent POST with Idempotency-Key). Bound attempts (≤ 5). Exponential backoff with jitter. |
| Circuit breaker | Open after N consecutive failures or error-rate > threshold. Stay open for a cooldown. Half-open to test recovery. |
| Concurrency | Bound concurrent in-flight requests per downstream (per-host pool). Never unbounded. |
| Idempotency | Stripe, Resend, Twilio support Idempotency-Key header. Use it. Store the key in an idempotency table; on retry, reuse the key. |
| Error classification | Retryable (network, 5xx, 429 with Retry-After) vs non-retryable (4xx except 429). Never retry 4xx except 429. |
| Rate limits | Honor `429` with `Retry-After`. Do not retry immediately. Back off. |
| Secrets | Read from env or secret manager; never hard-code. Rotate without downtime (read at startup, hot-reload on signal). |
| Webhook delivery | At-least-once delivery with idempotency key. Store outbound events in an outbox; relay worker delivers with retry + DLQ. |
| Observability | Tag every outbound call with the downstream name, trace context, and outcome. Surface "downstream slow" separately from "our code slow." |
| Fallbacks | Cached response (with explicit freshness), degraded response, or explicit failure. Never silent fallback to stale data. |
| Dependency criticality | Classify each downstream as fatal, degraded, or optional. Fatal = request fails. Degraded = subset of features missing. Optional = invisible to user. |

## Implementation procedure

1. Identify the downstream: API, version, authentication, idempotency support, rate limits.
2. Classify criticality: fatal, degraded, optional. Document per downstream.
3. Pick the timeout: per-call (≤ 5s) or derived from a parent deadline.
4. Pick the retry policy: attempts (≤ 5), backoff (exponential + jitter), retryable error set.
5. Pick the circuit breaker policy: failure threshold, cooldown, half-open attempts.
6. Pick the concurrency: per-host pool size, sized to the downstream's rate limit and your expected traffic.
7. Add observability: per-downstream latency histogram, error rate, circuit state, retry count.
8. For webhook delivery: write to outbox in the same DB transaction as the change; relay worker delivers with retry + DLQ.
9. Test under failure: kill the downstream; confirm circuit opens, fallback engages, request completes (or fails clearly).

## Failure modes

- No timeout on outbound HTTP → stalled downstream hangs the request indefinitely.
- Retry without idempotency → duplicate charge, duplicate email.
- Retry on 4xx → amplifies a validation error into a DoS on the downstream.
- No circuit breaker → cascading failure when the downstream is down.
- Per-request HTTP agent (no keep-alive) → TLS handshake per call, latency explodes.
- Unbounded concurrency → rate-limited by downstream, then blocked.
- Hard-coded API key → leaked via git, must rotate credentials under pressure.
- Webhook delivered directly from the handler → if the downstream is slow, the request times out; if the downstream fails, the data is lost.
- Silent fallback to cached data without surfacing it → user thinks they see fresh data.
- Error message says "request failed" → cannot distinguish "our network" from "their service down."

## Verification

- Test happy path: valid call → expected response.
- Test timeout: stub a slow response; confirm the call aborts within the deadline.
- Test retry: stub a 503 then a 200; confirm one retry, success.
- Test circuit breaker: stub 5 consecutive failures; confirm the breaker opens and stays open during cooldown.
- Test idempotency: send the same Idempotency-Key twice; confirm one downstream call, two identical responses.
- Test rate-limit handling: stub a 429 with `Retry-After: 5`; confirm the call retries after 5s, not immediately.
- Test webhook delivery: outbox insertion + relay worker + downstream 500 → relay retries → DLQ after max attempts.
- Inspect metrics: per-downstream p99 latency, error rate, circuit state, retry count all visible.
- Source references: https://nodejs.org/api/globals.html#fetch, https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.3, https://stripe.com/docs/api/idempotent_requests, https://github.com/nickuraltsev/opossum, https://aws.amazon.com/builders-library/timeouts-retries-backoff-jitter/, https://microservices.io/patterns/reliability/circuitbreaker.html.
