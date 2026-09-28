---
name: node-performance
description: Use when diagnosing or improving Node.js latency, event-loop blocking, memory growth, CPU saturation, backpressure, throughput, or load behavior.
---

# Node Performance

## Purpose
Measure bottlenecks before changing architecture or adding infrastructure.

## Activate when
Latency regresses, CPU/memory rises, event-loop lag appears, or queue/stream backlog grows.

## Repository inspection
Inspect workload, latency budget, deployment resources, event-loop behavior, heap behavior, DB calls, and dependencies.

## Decision rules
Establish a baseline. Separate CPU, memory, I/O, DB, and contention bottlenecks. Move CPU-heavy work to workers rather than hiding it behind promises. Respect backpressure. Bound caches and queues.

## Implementation procedure
1. Capture representative workload. 2. Measure dominant resource. 3. Profile. 4. Apply targeted optimization. 5. Re-run same workload. 6. Record evidence.

## Failure modes
Toy benchmarks; mismatched environments; concurrency used to hide dependency slowness; unbounded buffering.

## Verification
Use repeatable performance tests and record environment, workload, baseline, result, and variance.

## Source foundation
https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop
