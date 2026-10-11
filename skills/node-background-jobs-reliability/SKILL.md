---
name: node-background-jobs-reliability
description: Use when designing or changing Node.js queue workers, retries, backoff, dead-letter queues, idempotency, or background job reliability.
---

# Node Background Jobs Reliability

## Purpose

Background jobs are the place where reliability promises are kept or broken. A queue consumer assumes at-least-once delivery until proven otherwise. A retry without an idempotency decision is a defect.

## Activate when

- Adding or changing queue workers (BullMQ, AMQP, SQS, Kafka consumers).
- Modifying retry policy, backoff, max attempts, or dead-letter handling.
- Diagnosing duplicate processing, poison messages, or worker starvation.
- Adding outbox/transactional-outbox patterns to decouple writes from side effects.
- Introducing idempotency keys, deduplication windows, or consumer rebalancing.

## Repository inspection

1. Queue library — grep for `bullmq`, `bull`, `amqplib`, `kafkajs`, `aws-sdk` SQS/SNS/EventBridge, `@aws-sdk/client-sqs`, `ioredis`, `redis` Streams. Read the version.
2. Worker definitions — find every `worker.process(`, `queue.process(`, `consumer.run(`, `app.subscribe(`. List the queue, concurrency, and job name.
3. Retry config — grep for `attempts`, `backoff`, `retryStrategy`, `maxRetries`, `Retry-After`. Confirm the policy per queue.
4. DLQ — grep for `deadLetter`, `DLQ`, `deadLetterQueue`. Find the DLQ destination and the alert on it.
5. Idempotency — grep for `idempotencyKey`, `deduplicationId`, `messageDeduplicationId`. Find where duplicates are detected.
6. Outbox — grep for `outbox`, `transactional_outbox`, `Outbox`. Find the publisher and the relay worker.
7. Concurrency — find the per-worker concurrency setting and the total worker count.

## Decision rules

| Concern | Rule |
|---|---|
| Delivery guarantee | Assume at-least-once. Code idempotent consumers or prove exactly-once from the broker contract (very rare). |
| Idempotency | Every consumer deduplicates on a stable key (job ID, business ID + operation hash). Store the dedupe key in a unique constraint. |
| Retry policy | Bounded: max attempts (typically 5), exponential backoff with jitter, max total duration ≤ the SLA. |
| Backoff | Exponential with full jitter: `delay = min(cap, random(0, base * 2^attempt))`. Linear or fixed backoff synchronizes retries into thundering herds. |
| Poison messages | After max attempts, move to a DLQ, emit an alert, and stop retrying. Never infinite-retry a poison message. |
| Visibility timeout | Set ≥ p99 processing time × safety margin (typically 3×). Too short → premature redelivery. Too long → slow retry. |
| Concurrency | Per-worker concurrency sized to the downstream capacity, not the worker count. One BullMQ worker with concurrency 10 = 10 in-flight jobs. |
| Outbox | Decoupling writes from side effects: write to outbox in the same DB transaction as the change, relay worker publishes to the queue. Survives process crash. |
| Consumer rebalancing | On scale-up, ensure no message is in-flight on the dying worker. Cooperative rebalancing preferred. |
| Graceful shutdown | Stop accepting new messages, finish in-flight, ack at-least-once or nack for retry, exit within the grace period. |
| Error classification | Retryable (network, 5xx, timeout) vs non-retryable (4xx validation, schema mismatch). Never retry non-retryable. |

## Implementation procedure

1. State the delivery contract: at-least-once, at-most-once, or exactly-once. Prove exactly-once from the broker (Kafka idempotent producer + transactions) or assume at-least-once.
2. Identify the idempotency key: job ID, business ID + operation hash, or message attribute. Add a unique constraint on `(dedupe_key, scope)`.
3. Pick the retry policy: max attempts, backoff (exponential + jitter), max total duration. Document per queue.
4. Configure the DLQ: destination, alert, manual re-drive process.
5. For outbox: add an `outbox` table in the same DB as the change; the writing transaction inserts into the outbox; a relay worker reads, publishes, marks published.
6. For graceful shutdown: trap SIGTERM, stop consuming, finish in-flight, ack/nack, exit.
7. Test under failure: kill the consumer mid-job; redelivery occurs; idempotency holds; the side effect happens exactly once.

## Failure modes

- Retry without idempotency → double-charge, double-email, double-state-transition.
- Linear backoff → all workers retry at the same instant → thundering herd.
- Visibility timeout < p99 processing → redelivery of in-flight jobs → duplicate side effects.
- Infinite retry on poison message → queue grows forever, alerts drown.
- Worker stops mid-job without acking → message redelivered; if the side effect already happened, duplicate.
- Outbox published before the DB transaction commits → consumer reads the message, queries for the not-yet-committed state, fails.
- Outbox relay crashes after publish but before mark-published → message republished → duplicate.
- Worker scaled up; rebalancing gives a partition to a new worker while the old worker is mid-job → redelivery.
- Concurrency too high → downstream DB saturated; too low → queue backlog grows.

## Verification

- Test idempotency: deliver the same message twice; confirm one side effect.
- Test retry: inject a transient failure; confirm backoff and max-attempts respected.
- Test DLQ: inject a poison message; confirm it lands in the DLQ after max attempts.
- Test visibility: simulate a slow consumer; confirm no premature redelivery.
- Test graceful shutdown: SIGTERM mid-job; confirm the job completes or is redelivered.
- Test outbox relay crash: kill relay after publish, before mark; confirm republish is deduplicated by the consumer.
- Inspect DLQ depth as a metric; alert when nonzero.
- Source references: https://docs.bullmq.io/, https://www.rabbitmq.com/reliability.html, https://kafka.apache.org/documentation/#semantics, https://aws.amazon.com/sqs/faqs/, https://microservices.io/patterns/data/transactional-outbox.html, https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/.
