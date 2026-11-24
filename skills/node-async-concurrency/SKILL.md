---
name: node-async-concurrency
description: Use when designing or changing Node.js Promise concurrency, cancellation, AbortController, timeouts, race conditions, or bounded concurrency.
---

# Node Async Concurrency

## Purpose

Treat async work as failure-prone and resource-bounded. The event loop is single-threaded; unbounded concurrency is the single most common cause of latency spikes, memory pressure, and cascading failures in Node backends. The discipline is threefold: every fan-out is bounded by a documented number, every async operation carries an `AbortSignal` tied to its caller's deadline, and shared mutable state is guarded by atomic mechanisms (DB constraints, compare-and-swap) — never by promise ordering.

## Boundary with related skills

- Use `node-production-runtime` for the process lifecycle that drains in-flight async work at shutdown.
- Use `node-background-jobs-reliability` for queue-side concurrency (worker counts, backpressure, retries).
- Use `node-worker-threads` for CPU-bound offloading with pool sizing.
- Use `node-idempotency` for the safe-retry contract that bounded retries depend on.
- Use `node-external-integrations` for downstream client pool/dispatcher configuration.

## Activate when

- Adding concurrent async work (Promise.all, worker pools, fan-out calls).
- Changing cancellation behavior (AbortController, AbortSignal, signal propagation).
- Diagnosing race conditions, deadlocks, or stalled async work.
- Tuning concurrency limits (HTTP client sockets, queue workers, batch sizes).
- Adding timeouts, deadlines, or backpressure to async flows.

## Repository inspection

1. Async patterns — grep for `Promise.all`, `Promise.allSettled`, `Promise.race`, `await` in loops, `p-limit`, `p-queue`.
2. Cancellation — grep for `AbortController`, `AbortSignal`, `signal:`, `addEventListener("abort"`.
3. Timeouts — grep for `setTimeout(`, `AbortSignal.timeout(`, `Promise.race` with timeout.
4. Worker pools — grep for `worker_threads`, `piscina`, `@fastify/under-pressure`.
5. HTTP clients — grep for `undici`, `fetch`, `axios`, `got`. Read pool/dispatcher config (`connections`, `pipelining`, `maxRequestsPerHost`).
6. Queue workers — grep for `BullMQ`, `Bull`, `amqplib`, `kafkajs`. Read concurrency config.
7. Memory pressure — check for `--max-old-space-size`, `process.memoryUsage()` instrumentation.

## Decision rules

| Concern | Rule |
|---|---|
| Concurrency bound | Always bound concurrent async work. `Promise.all` over 1000 items is a defect. |
| Cancellation | Propagate `AbortSignal` to every async operation that supports it. Cancellation must release resources, not strand work. |
| Deadlines | One end-to-end deadline per request. Derive child timeouts from it; do not invent new ones. |
| Race conditions | Use atomic operations (DB constraints, compare-and-swap) for shared mutable state. Never rely on Promise ordering. |
| Backpressure | Streaming pipelines must propagate pressure; never buffer unboundedly. |
| Worker pool | Size to CPU cores for CPU-bound work; to I/O capacity for I/O-bound work. |
| AsyncLocalStorage | Use for request context; do not pass through function parameters when crossing many layers. |
| Error handling | `Promise.all` fails fast on first rejection; use `Promise.allSettled` for fan-out where partial success is acceptable. |
| Memory | Concurrent in-flight items each hold memory; bound the queue size to bound the memory ceiling. |

## Implementation procedure

1. Identify the async work: fan-out, fan-in, or both. Identify the resource being bounded (memory, sockets, DB connections, CPU).
2. Pick the bound: maximum concurrent in-flight operations. Document why this number.
3. Implement the bound with `p-limit`, a worker pool, or a queue with explicit concurrency.
4. Propagate cancellation: thread `AbortSignal` from the caller to every downstream operation.
5. Implement the deadline: derive from the caller's deadline; if none, set one explicitly.
6. Test under saturation: feed the pipeline N+1 items where N is the bound; confirm the (N+1)th waits.
7. Test cancellation: abort mid-flight; confirm resources are released, no leaked sockets.

**Reference example** — bounded fan-out with deadline propagation to every downstream call:

```ts
import pLimit from "p-limit";

// ONE end-to-end deadline per request; child timeouts derive from it, never exceed it.
async function fetchAllPrices(skus: string[], opts: { signal: AbortSignal; deadlineMs: number }) {
  const limit = pLimit(8);                                    // bound: 8 concurrent — tuned to the downstream
                                                              // rate limit, not "whatever Promise.all does"
  const childTimeout = Math.min(5_000, opts.deadlineMs);      // derived from the deadline, ≤ it
  const results = await Promise.allSettled(
    skus.map((sku) =>
      limit(async () => {
        const perCall = AbortSignal.any([opts.signal, AbortSignal.timeout(childTimeout)]);
        const res = await fetch(`${PRICE_API}/${encodeURIComponent(sku)}`, { signal: perCall });
        if (!res.ok) throw new Error(`price fetch failed: ${res.status}`);
        return { sku, price: await res.json() } as const;
      }),
    ),
  );

  const ok = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed === results.length && results.length > 0) throw new Error("all price lookups failed");
  return { prices: ok, degraded: failed > 0 };                // partial success is a modeled outcome
}

// Caller: one deadline, threaded signal — client disconnect cancels everything below.
app.get("/prices", async (req, res) => {
  const out = await fetchAllPrices(String(req.query.skus).split(","), {
    signal: req.abortSignal,                                  // request-scoped abort
    deadlineMs: 8_000,
  });
  res.status(out.degraded ? 207 : 200).send(out);
});
```

Every rule is visible: the bound is a number with a reason, the child timeout derives from the request deadline, `AbortSignal.any` composes caller-cancel with per-call timeout, `allSettled` models partial success instead of fail-fast, and a total failure is a thrown, typed outcome.

## Failure modes

- `Promise.all` over a large list explodes memory or hits external rate limits.
- Unbounded retry loop on a failing downstream → worker pool exhaustion.
- Missing `AbortSignal` propagation → request completes after the client has gone, wasting resources.
- Multiple `setTimeout`s with no parent deadline → request can run for the sum of all timeouts.
- Race condition: two concurrent updates to the same row → last writer wins, integrity lost.
- Worker pool sized to CPU count for I/O-bound work → 80% idle CPU, low throughput.
- `AsyncLocalStorage` used for cross-request state → state leaks across requests under load.
- `Promise.race` with a timeout that does not cancel the losing promise → work continues, resources leak.

## Verification

- Test saturation: feed the pipeline more items than the bound; confirm backpressure.
- Test cancellation: abort mid-flight; confirm sockets/connections/threads return to zero.
- Test timeout: assert the request fails within the deadline, not after.
- Test concurrency: confirm only N operations run at once.
- Test partial failure: one item rejects; confirm the rest complete (for `allSettled`) or the whole rejects (for `all`).
- Inspect `lsof -p <pid>` or `process._getActiveHandles()` for leaked handles after the test.
- Source references: https://nodejs.org/api/globals.html#promise, https://nodejs.org/api/globals.html#abortcontroller, https://nodejs.org/api/worker_threads.html, https://nodejs.org/api/async_context.html.
