---
name: node-retry-timeouts
description: Use when adding retries, timeouts, deadlines, cancellation, backoff, jitter, or failure handling around Node.js network and asynchronous operations.
license: MIT
---

# Retry and Timeout Policies

## Purpose

Retries and timeouts are capacity controls, not generic error-handling boilerplate. They must share a deadline and an explicit safety policy. The contract: one end-to-end budget, per-attempt bounds derived from it, eligibility decided by failure class and idempotency, and cancellation that actually reaches the pending work.

## Activate when

- A dependency call can fail transiently.
- An operation needs an upper bound on waiting.
- Adding automatic retry or exponential backoff.

## Boundary with related skills

- Use `node-retry-timeouts` for retry/timeout/deadline policy around calls.
- Use `node-circuit-breakers` when the question is protecting the dependency from repeated failure (open/half-open trips) rather than retrying this call.
- Use `node-async-concurrency` for bounding concurrent retry work across many operations.
- Use `node-idempotency` for the safe-replay design of non-idempotent operations.

## Repository inspection

Identify operation idempotency, caller deadline, downstream timeout, retry budget, concurrency, error taxonomy, and cancellation propagation. Find the existing retry helper: repositories accumulate several; extend or replace deliberately rather than adding another.

## Decision rules

| Concern | Rule |
|---|---|
| Eligibility | Retry only failures classified as transient and only when the operation is safe to repeat. |
| Deadline | Prefer one end-to-end deadline propagated through nested calls. |
| Timeout | Every network/queue dependency needs a bounded timeout appropriate to its SLA. |
| Attempts | Bound maximum attempts and total retry time. |
| Backoff | Use exponential or bounded backoff with jitter to reduce synchronized retries. |
| Cancellation | Abort pending work when the caller deadline or service shutdown wins. |
| Budget | Retries consume the same capacity budget as normal traffic. |

Classification table (extend per dependency):

| Failure | Retry? |
|---|---|
| Network unreachable / connection reset | Yes (transient) |
| HTTP 408, 425, 429 (with Retry-After honored) | Yes |
| HTTP 5xx | Yes, if the operation is idempotent and the 5xx is not a deterministic bug |
| HTTP 4xx (400/401/403/422) | No (permanent) |
| Connection timeout | Yes, with fresh connection |
| Response timeout after request sent | Only if idempotent — the side effect may have happened |
| Malformed response | No — a contract bug retrying will reproduce |
| Cancellation (caller aborted) | Never — propagate |

## Implementation procedure

1. Classify retryable versus permanent failures.
2. Define the operation's idempotency/replay behavior.
3. Derive per-attempt timeout from an end-to-end deadline.
4. Apply bounded backoff and jitter.
5. Propagate AbortSignal/cancellation to supported downstream clients.
6. Record attempts, final outcome, and elapsed deadline budget.

**Reference example** — a deadline-aware retry with classification, jittered backoff, and cancellation:

```ts
type RetryPolicy = {
  maxAttempts: number;        // bounded, derived from the deadline
  baseDelayMs: number;
  maxDelayMs: number;
  classify: (error: unknown) => "retryable" | "permanent" | "aborted";
};

export async function withRetry<T>(
  operation: (attempt: number, signal: AbortSignal) => Promise<T>,
  { maxAttempts = 3, baseDelayMs = 200, maxDelayMs = 2_000, classify }: RetryPolicy,
  { deadlineMs = 8_000, signal }: { deadlineMs: number; signal?: AbortSignal } = {},
): Promise<T> {
  const deadline = Date.now() + deadlineMs;
  const controller = new AbortController();
  signal?.addEventListener("abort", () => controller.abort(signal.reason), { once: true });

  for (let attempt = 1; ; attempt++) {
    const remaining = deadline - Date.now();
    const attemptTimeout = Math.min(remaining, perAttemptMs);   // derived, never fixed
    if (attemptTimeout <= 0) throw new DeadlineExhaustedError(attempt - 1);

    try {
      return await withTimeout(operation(attempt, controller.signal), attemptTimeout);
    } catch (error) {
      if (controller.signal.aborted) throw error;               // caller won: stop now
      const verdict = classify(error);
      if (verdict === "permanent" || attempt >= maxAttempts) throw error;
      if (Date.now() + backoffMs(attempt) >= deadline) throw new DeadlineExhaustedError(attempt);

      await sleep(backoffMs(attempt), signal);                  // jittered, cancellable
    }
  }
}

const backoffMs = (attempt: number) => {  // full jitter: never synchronized across instances
  const exponential = Math.min(2 ** (attempt - 1) * BASE, MAX);
  return Math.random() * exponential;
};

// Classification for an HTTP dependency
const classifyHttp: RetryPolicy["classify"] = (error) => {
  if (error instanceof AbortedError) return "aborted";
  if (error instanceof HttpError) {
    const status = error.status;
    if (status === 408 || status === 425 || status === 429) return "retryable";
    if (status >= 500) return "retryable";   // caller gates this on idempotency
    return "permanent";                       // 400/401/403/422: retrying reproduces it
  }
  if (error instanceof TypeError /* fetch network error */) return "retryable";
  return "permanent";                         // unknown: fail fast, do not amplify
};
```

Budget propagation rule: a caller with an 8s deadline passes `deadlineMs: remaining` to each nested call; nested retry stacks multiply (3 retries × 3 layers = up to 64 attempts) unless every layer shares the one clock.

## Failure modes

- Five-second timeout plus three retries turns a one-second request into a twenty-second request — budget math never done.
- Retries continue after the caller has disconnected (no AbortSignal wiring; the response is gone but the dependency still burns).
- Non-idempotent mutation retried after ambiguous success — the first POST charged the card; the retry charges again.
- All instances retry on identical schedules (no jitter) — thundering herd on recovery.
- Nested retries multiply attempts across the call graph without a shared deadline.
- Retrying 400/422 — reproducing a contract bug three times before failing.
- Honoring `Retry-After` never: a 429 with `Retry-After: 30` met with 200ms backoff = hammering a rate-limited dependency.

## Verification

Test deadline exhaustion (elapsed <= deadlineMs + epsilon, attempts recorded), cancellation (caller aborts mid-backoff → no further attempt), transient versus permanent classification (4xx not retried), ambiguous mutation outcomes (idempotent replay succeeds; non-idempotent surfaces AmbiguousError), jitter bounds (all delays within [0, maxDelayMs]), and nested budgets (inner layer cannot exceed the outer deadline). Inject faults at the fetch boundary; assert attempt telemetry.
