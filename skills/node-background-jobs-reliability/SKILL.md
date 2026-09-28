---
name: node-background-jobs-reliability
description: reliability
---

# Node Background Jobs Reliability

## Purpose
Use when implementing Node.js queues, workers, scheduled jobs, retries, dead-letter handling, idempotency, outbox patterns, or at-least-once delivery.

## Activate when
Assume jobs can fail after partial work and can execute more than once.

## Repository inspection
- Workers or queues.
- Retry/backoff.
- Events after database writes.

## Decision rules
Inspect delivery/ack semantics, retries, job payloads, idempotency, dead-letter behavior, and persistence state transitions.

## Implementation procedure
- Make handlers idempotent when delivery can repeat.
- Persist deduplication keys when duplicates matter.
- Use bounded retries with backoff and jitter where supported.
- Use an outbox when atomic cross-system publication is required.
- Make poison-message recovery explicit.

## Failure modes
1. Define delivery semantics.
2. Identify a durable idempotency key.
3. Define retryable and terminal failures.
4. Implement recovery/dead-letter behavior.
5. Test duplicates and crash windows.

## Verification
- Retrying non-idempotent side effects.
- Ack before durable state.
- Infinite retries.
- Missing dead-letter visibility.

## Source foundation
Test duplicate delivery, timeout, crash-after-side-effect, retry exhaustion, dead-letter handling, and replay.
