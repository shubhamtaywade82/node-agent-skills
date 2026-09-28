---
name: node-backpressure
description: Use when producers can outpace consumers in streams, HTTP bodies, queues, sockets, or asynchronous pipelines and memory/resource bounds must be preserved.
---

# Backpressure

## Purpose
Backpressure keeps production rate bounded by downstream capacity rather than allowing unbounded buffering.

## Activate when
- A stream or event producer can outpace processing.
- WebSocket clients are slow.
- Async pipelines accumulate pending work.

## Repository inspection
Trace producer, buffer, consumer, cancellation, queue depth, memory growth, and transport flow-control behavior.

## Decision rules
| Concern | Rule |
|---|---|
| Buffer | Every buffer needs a finite bound or an explicit spill-to-durable-storage design. |
| Control | Prefer native stream/transport flow control when available. |
| Slow consumer | Choose block, batch, sample, drop, disconnect, or durable queue semantics deliberately. |
| Cancellation | Stop upstream production when downstream work is abandoned. |
| Priority | Preserve critical events/work when capacity is limited. |
| Memory | Monitor queued bytes/items and processing latency, not only throughput. |

## Implementation procedure
1. Measure producer and consumer rates.
2. Choose the buffering point and hard bound.
3. Implement flow control or a documented overflow policy.
4. Propagate cancellation upstream.
5. Instrument queue depth, wait time, drops, and memory.
6. Test sustained imbalance and recovery.

## Failure modes
- Promise arrays become an unbounded hidden queue.
- Socket writes accumulate for slow clients.
- Stream backpressure is ignored by converting everything into buffers.
- Drops occur without telling operators or clients.

## Verification
Run faster-producer/slower-consumer tests and verify bounded memory, deterministic overflow behavior, cancellation, and recovery.
