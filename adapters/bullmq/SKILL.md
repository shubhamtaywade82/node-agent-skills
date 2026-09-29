---
name: bullmq
description: Use when a Node.js backend uses BullMQ 5.x or 6.x for queues, workers, retries, delayed jobs, scheduling, rate limits, or Redis-backed background processing.
---

# BullMQ Adapter

## Purpose
Translate framework-neutral queue reliability rules into BullMQ while respecting its current Node.js API and Redis connection semantics.

## Activate when
Detect bullmq in package.json and verify the installed major. Current Node.js BullMQ releases are on the 6.x line; retain 5.x guidance for existing applications that have not migrated.

## Repository inspection
Inspect Queue, Worker, QueueEvents, JobScheduler usage, Redis connection mode, worker concurrency, retry/backoff settings, retention, shutdown path, and job identifiers.

## Decision rules
- Design every retryable job to be idempotent; BullMQ documents idempotence as a prerequisite for safe retry behavior.
- Bound worker concurrency from downstream capacity.
- Separate producer and worker Redis connection requirements when their availability/retry behavior differs.
- QueueScheduler is not required for modern BullMQ for delayed jobs; do not copy pre-2.0 guidance.
- Use JobScheduler for current scheduling APIs rather than legacy repeatable-job recipes when the installed version supports it.
- Configure Redis production policy deliberately; queue correctness depends on Redis not evicting queue data.

## Implementation procedure
1. Detect BullMQ major and Redis client mode.
2. Define job identity, payload version, retry budget, and failure classes.
3. Configure Worker concurrency and backoff.
4. Validate job data at worker entry.
5. Implement idempotent side effects and dead-letter/quarantine handling.
6. Close workers and queue resources during graceful shutdown.

## Failure modes
- Old QueueScheduler recipes are copied into modern BullMQ.
- Worker retries repeat a non-idempotent external side effect.
- Queue producer waits indefinitely during Redis outage.
- Worker shutdown leaves active work without a recovery path.
- Job payload embeds non-durable process-local state.

## Verification
Test duplicate job delivery, retry/backoff, poison jobs, Redis outage, worker restart, graceful shutdown, and queue retention.

## Sources
- https://docs.bullmq.io/patterns/idempotent-jobs
- https://docs.bullmq.io/guide/queues/
- https://docs.bullmq.io/guide/connections
- https://docs.bullmq.io/guide/going-to-production
