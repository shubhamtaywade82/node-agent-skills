---
name: node-async-concurrency
description: Use when designing or changing Node.js Promise concurrency, cancellation, AbortController, timeouts, race conditions, or bounded concurrency.
---

# Node Async Concurrency

## Purpose

Treat async work as failure-prone and resource-bounded. The event loop is single-threaded; unbounded concurrency is the single most common cause of latency spikes, memory pressure, and cascading failures in Node backends.

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
