---
name: node-performance
description: performance
---

# Node Performance

## Purpose
Use when diagnosing or improving Node.js latency, event-loop blocking, memory growth, CPU saturation, backpressure, throughput, or load behavior.

## Activate when
Measure bottlenecks before changing architecture or adding infrastructure.

## Repository inspection
- Latency regression.
- CPU or memory pressure.
- Event-loop lag.
- Queue or stream backlog.

## Decision rules
Inspect workload, latency budget, deployment resources, event-loop behavior, heap behavior, database calls, and network dependencies.

## Implementation procedure
- Establish a baseline first.
- Separate CPU, memory, I/O, database, and contention bottlenecks.
- Move CPU-heavy work to workers rather than wrapping it in more promises.
- Respect stream backpressure.
- Bound caches and queues.

## Failure modes
1. Capture representative workload.
2. Measure the dominant resource.
3. Profile before changing.
4. Apply the smallest targeted optimization.
5. Re-run the same workload.
6. Record evidence.

## Verification
- Toy benchmarks.
- Mismatched environments.
- Increasing concurrency to hide slow dependencies.
- Unbounded buffering.

## Source foundation
Use repeatable performance tests and record environment, workload, baseline, result, and variance.
