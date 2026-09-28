---
name: node-background-jobs-reliability
description: Use when implementing Node.js queues, workers, scheduled jobs, retries, dead-letter handling, idempotency, outbox patterns, or at-least-once delivery.
---

# Node Background Jobs Reliability

## Purpose
Assume jobs can fail after partial work and can execute more than once.

## Activate when
Create workers/queues, add retry/backoff, or publish events after database writes.

## Repository inspection
Inspect delivery/ack semantics, retries, job payloads, idempotency, dead-letter behavior, and persistence state transitions.

## Decision rules
Make handlers idempotent when delivery can repeat. Persist deduplication keys when needed. Use bounded retries with backoff/jitter. Use an outbox when atomic publication is required. Make poison-message recovery explicit.

## Implementation procedure
1. Define delivery semantics. 2. Identify durable idempotency key. 3. Define retryable/terminal failures. 4. Implement recovery. 5. Test duplicates and crash windows.

## Failure modes
Retrying non-idempotent side effects; ack before durable state; infinite retries; invisible dead letters.

## Verification
Test duplicate delivery, timeout, crash-after-side-effect, retry exhaustion, dead-letter handling, and replay.

## Source foundation
https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html
