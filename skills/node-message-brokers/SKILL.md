---
name: node-message-brokers
description: Use when integrating durable event brokers or streams, defining consumer groups, offsets, partitions, ordering, replay, lag, or event-driven service communication.
---

# Message Brokers

## Purpose
Treat broker delivery as a distributed log or message system whose guarantees must be explicitly mapped to application state transitions.

## Activate when
- Publishing domain or integration events to a broker.
- Consuming Kafka-like streams or durable queues across services.
- Designing replay, consumer groups, partitions, or ordering.

## Repository inspection
Identify broker technology, topic/stream partitioning, consumer groups, delivery guarantee, acknowledgement/offset policy, retention, event schema/versioning, producer retries, and observability.

## Decision rules
| Concern | Rule |
|---|---|
| Delivery | Document at-most-once, at-least-once, or effectively-once semantics per flow. |
| Offset | Commit/ack only at the point that matches durable processing semantics. |
| Replay | Consumers must tolerate replay from a known offset or event ID. |
| Ordering | Ordering usually holds only within the broker ordering unit; do not assume global ordering. |
| Schema | Evolve event contracts compatibly across producer/consumer versions. |
| Poison events | Quarantine or dead-letter invalid/permanently failing events without blocking unrelated partitions when possible. |
| Lag | Treat consumer lag as capacity/health telemetry, not merely a dashboard number. |

## Implementation procedure
1. Define event identity and ordering requirements.
2. Choose partition/key strategy from business ordering constraints.
3. Validate event envelopes at the consumer boundary.
4. Perform the durable state transition.
5. Commit or acknowledge according to the state-transition boundary.
6. Make replay and duplicate handling explicit.

## Failure modes
- Offset committed before durable side effects.
- Global ordering assumed from partition-local ordering.
- Consumer cannot replay after a code defect.
- Event schema changes break an older consumer.
- One poison event stalls unrelated work.

## Verification
Test duplicate delivery, replay from old offsets, out-of-order events, consumer restart, lag growth, malformed events, and incompatible schema changes.
