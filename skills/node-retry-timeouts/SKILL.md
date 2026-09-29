---
name: node-retry-timeouts
description: Use when adding retries, timeouts, deadlines, cancellation, backoff, jitter, or failure handling around Node.js network and asynchronous operations.
---

# Retry and Timeout Policies

## Purpose
Retries and timeouts are capacity controls, not generic error-handling boilerplate. They must share a deadline and an explicit safety policy.

## Activate when
- A dependency call can fail transiently.
- An operation needs an upper bound on waiting.
- Adding automatic retry or exponential backoff.

## Repository inspection
Identify operation idempotency, caller deadline, downstream timeout, retry budget, concurrency, error taxonomy, and cancellation propagation.

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

## Implementation procedure
1. Classify retryable versus permanent failures.
2. Define the operation's idempotency/replay behavior.
3. Derive per-attempt timeout from an end-to-end deadline.
4. Apply bounded backoff and jitter.
5. Propagate AbortSignal/cancellation to supported downstream clients.
6. Record attempts, final outcome, and elapsed deadline budget.

## Failure modes
- Five-second timeout plus three retries turns a one-second request into a twenty-second request.
- Retries continue after the caller has disconnected.
- Non-idempotent mutation is retried after ambiguous success.
- All instances retry on identical schedules.
- Nested retries multiply attempts across the call graph.

## Verification
Test deadline exhaustion, cancellation, transient versus permanent errors, ambiguous mutation outcomes, jitter behavior, and nested retry budgets.
