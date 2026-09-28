---
name: node-queues
description: Use when implementing background jobs, queue workers, delayed work, retries, dead-letter handling, job scheduling, or asynchronous processing in Node.js.
---

# Queues

## Purpose
Model queue systems as durable asynchronous delivery mechanisms with explicit delivery semantics, ownership, retry policy, and replay-safe processing.

## Activate when
- Moving work out of HTTP request paths.
- Adding workers, scheduled jobs, delayed jobs, or retry handling.
- Processing work that may execute more than once.

## Repository inspection
Inspect producer/consumer topology, queue backend, delivery guarantee, visibility/lock semantics, concurrency, job retention, retry policy, dead-letter handling, and shutdown behavior.

## Decision rules
| Concern | Rule |
|---|---|
| Delivery | Assume at-least-once unless the infrastructure contract proves otherwise. |
| Idempotency | Make job effects idempotent or deduplicated before enabling retries. |
| Retries | Retry only transient failures; bound attempts and use backoff/jitter. |
| Poison jobs | Route permanently failing work to a dead-letter or quarantine path with operator visibility. |
| Concurrency | Bound worker concurrency by downstream capacity, not CPU availability alone. |
| Payloads | Keep payloads small, durable, versioned, and independent of process state. |
| Ordering | Treat ordering as a property that must be provided by the queue contract, not assumed. |
| Shutdown | Stop accepting new work, finish or safely release in-flight jobs, then close consumers. |

## Implementation procedure
1. Define job contract, ownership, and delivery semantics.
2. Add durable identifiers and idempotency strategy.
3. Configure concurrency, retry budget, backoff, and dead-letter behavior.
4. Validate job payloads at the worker boundary.
5. Record attempt/outcome metadata and correlation IDs.
6. Test duplicate, timeout, poison, retry, and shutdown scenarios.

## Failure modes
- HTTP request waits for a long job and times out.
- Retried job repeats a non-idempotent side effect.
- Worker concurrency overwhelms a downstream API.
- Failed jobs retry forever.
- Large payloads make queue storage the accidental database.

## Verification
Test duplicate delivery, transient versus permanent failure, dead-letter routing, retry backoff, worker restart, and bounded concurrency.

## Sources
- https://docs.bullmq.io/patterns/idempotent-jobs
- https://docs.bullmq.io/guide/queues/
