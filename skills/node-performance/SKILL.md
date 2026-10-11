---
name: node-performance
description: Use when profiling Node.js memory, heap, event loop lag, backpressure, or load; or when optimizing hot-path query or batch latency.
---

# Node Performance

## Purpose

Performance engineering is a budget, not a goal. Latency, memory, and CPU each have explicit ceilings; work that exceeds them is a defect.

## Activate when

- Profiling memory, heap, or GC behavior.
- Diagnosing event-loop lag, request stalls, or batch latency spikes.
- Optimizing hot-path queries, batch operations, or large payload handling.
- Tuning stream backpressure, buffer sizes, or worker pool sizing.
- Load testing a new endpoint or refactor.

## Repository inspection

1. Profiling — grep for `--prof`, `--inspect`, `clinic`, `0x`, `--cpu-prof`, `--heap-prof`. Find the tooling the team uses.
2. Memory — grep for `--max-old-space-size`, `process.memoryUsage()`, `gc()`, `--expose-gc`. Find the heap ceiling.
3. Event loop — grep for `monitorEventLoopDelay`, `perf_hooks`, `eventLoopLag`. Find the lag metric.
4. Streams — grep for `pipeline(`, `Readable.from`, `Transform`, `Writable`. Find stream pipelines and their high-water marks.
5. Worker threads — grep for `worker_threads`, `piscina`, `workerpool`. Find CPU-bound work offloaded from the event loop.
6. Hot paths — read the route table; identify the top 5 by traffic. Read each handler and its query plan.
7. Benchmarks — grep for `benchmark`, `tinybench`, `mitata`. Find the existing benchmark suite.

## Decision rules

| Concern | Rule |
|---|---|
| Budget | Define latency SLOs: p99 < 200ms for reads, < 1s for mutations, < 5s for batch. Memory ceiling per process. CPU per request. |
| Event loop | No synchronous work > 5ms on the event loop. Move CPU-bound work to a worker pool. |
| Streams | Pipeline streams; respect backpressure. Never `readable.pipe(writable)` without an error handler on both. |
| Memory | Bound in-flight items: queue depth, in-memory cache size, request body size. |
| Hot path | Measure before optimizing. `EXPLAIN ANALYZE` for queries, `--cpu-prof` for CPU, `--heap-prof` for memory. |
| GC | Avoid forcing GC. Avoid allocations in hot paths (use Buffer pools, reusable arrays). |
| Caching | Cache the hot read path; never cache writes. Set explicit TTLs and invalidation. |
| Worker pool | Size to CPU cores for CPU-bound work, to I/O capacity for I/O-bound. |
| Batching | Batch writes when possible (bulk insert, batch SQL). Bound the batch size to bound memory. |
| Connection reuse | HTTP keep-alive on for outbound. Connection pool on for DB. |
| Compression | Negotiate gzip/brotli for ≥ 1KB responses. Don't compress smaller responses. |
| Async vs sync | File I/O is async. Crypto is sync for small inputs, async via `worker_threads` for large. |

## Implementation procedure

1. Define the budget: latency SLO (p50, p95, p99), memory ceiling, CPU per request.
2. Measure the current state: `EXPLAIN ANALYZE` for queries, `--cpu-prof` for the hot endpoint, `--heap-prof` for memory.
3. Identify the bottleneck: query plan, allocation hot spot, event-loop block, lock contention.
4. Apply the smallest change that addresses the bottleneck. Re-measure. Iterate.
5. Add a benchmark that captures the before/after for the hot path. Commit it as a regression guard.
6. Add a metric (p99 latency, GC pause, queue depth) that surfaces regressions in production.
7. Run the load test (k6, autocannon, Artillery) at expected and 2× expected traffic; confirm the SLO holds.

## Failure modes

- `JSON.parse(JSON.stringify(largeArray))` to clone in a hot path → 100ms GC pause.
- `Buffer.concat` in a tight loop → many small Buffers → memory pressure.
- Synchronous `fs.readFileSync` at request time → event-loop block.
- `Promise.all` over 10k items → memory spike, possible OOM.
- Worker pool sized to CPU for I/O-bound work → 80% idle CPU, low throughput.
- No keep-alive on outbound HTTP → TLS handshake per request → latency.
- Cache without a TTL → unbounded memory growth → OOM after days.
- Stream pipe without error handler → unhandled `error` event crashes the process.
- Brotli compression on 200-byte responses → CPU cost exceeds the network savings.
- N+1 query in a hot path → p99 latency dominated by network round-trips, not query cost.

## Verification

- Run `--cpu-prof` on the hot endpoint under load; inspect the profile in `chrome://inspect` or Speedscope.
- Run `--heap-prof` for 10 minutes; inspect for allocation hot spots.
- Run `EXPLAIN ANALYZE` on the hot query before and after the change; save both plans.
- Run `autocannon -c 100 -d 30` against the endpoint; capture p50/p95/p99 and the error rate.
- Run `node --expose-gc --max-old-space-size=512` to surface memory pressure early.
- Confirm `monitorEventLoopDelay` metric stays below 5ms p99 under load.
- Confirm the benchmark in the repo shows the improvement (or no regression) before and after.
- Source references: https://nodejs.org/api/perf_hooks.html, https://nodejs.org/api/v8.html, https://nodejs.org/api/worker_threads.html, https://nodejs.org/api/stream.html, https://clinicjs.org/, https://github.com/nodejs/diagnostics/blob/main/tracing-guides/trace-event.md.
