---
name: node-runtime-diagnostics
description: Use when diagnosing Node.js CPU, memory, garbage collection, event-loop delay, async backlog, file-descriptor, socket, or process lifecycle problems in production.
---

# Runtime Diagnostics

## Purpose
Diagnose Node.js runtime behavior from measurements before changing code or infrastructure.

## Activate when
- Event-loop delay, memory growth, GC pressure, CPU saturation, or socket exhaustion appears.
- A service becomes slow despite normal downstream latency.
- A process crashes, hangs, or leaks resources.

## Repository inspection
Identify Node version, runtime flags, container limits, workload profile, metrics, heap snapshots/profiling tools, and recent changes.

## Decision rules
| Signal | First question |
|---|---|
| Event-loop delay | What synchronous or CPU-heavy work blocks the main thread? |
| Heap growth | Is retained memory growing, or is the heap simply sized larger during GC cycles? |
| CPU | Is work CPU-bound, serialization-heavy, crypto-heavy, or caused by excessive concurrency? |
| Handles | Are sockets, timers, file descriptors, or clients left open? |
| GC | Is allocation rate or object retention the driver? |
| Async backlog | Is work being admitted faster than downstream capacity? |

## Implementation procedure
1. Capture baseline and symptom metrics.
2. Correlate runtime signals with traffic/dependency behavior.
3. Use profiling or heap diagnostics to identify the dominant cost.
4. Reproduce under representative load where safe.
5. Change one capacity or code variable at a time.
6. Verify improvement with the same measurements.

## Failure modes
- Profiling changes the workload enough to hide the defect.
- Heap snapshot is taken without considering sensitive data handling.
- CPU is increased by adding concurrency to a CPU-bound workload.
- Event-loop delay is mistaken for database latency.
- Memory limits are raised instead of fixing an unbounded queue/cache.

## Verification
Measure event-loop delay, CPU, RSS/heap, GC, open handles, throughput, latency, and error rate before and after changes.
