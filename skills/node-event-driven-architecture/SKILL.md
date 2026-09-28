---
name: node-event-driven-architecture
description: Use when introducing domain events, integration events, asynchronous service boundaries, event contracts, or event-driven workflows in Node.js systems.
---

# Event-Driven Architecture

## Purpose
Events communicate facts or commands across failure boundaries. Their ownership, schema, delivery semantics, and replay behavior must be explicit.

## Activate when
- Introducing domain/integration events.
- Replacing synchronous service calls with asynchronous messaging.
- Designing event contracts across independently deployed services.

## Repository inspection
Map event producers/consumers, source-of-truth state, broker, event identity, schema/versioning, ordering, retry/dead-letter behavior, and observability.

## Decision rules
| Concern | Rule |
|---|---|
| Event meaning | Distinguish immutable facts from commands that request future work. |
| Ownership | One bounded context owns the authoritative event meaning. |
| Schema | Version contracts compatibly; consumers should tolerate additive evolution. |
| Delivery | Assume duplicates/replay unless exactly-once semantics are explicitly proven end to end. |
| Ordering | Define the specific aggregate/partition ordering needed; avoid global ordering assumptions. |
| Side effects | Consumers must make effects idempotent or transactionally claim work. |
| Coupling | Avoid leaking producer database schema as the public event contract. |

## Implementation procedure
1. Define event name, meaning, owner, ID, timestamp semantics, and schema.
2. Decide delivery and ordering guarantees.
3. Publish after durable source state is committed.
4. Validate events at consumer boundaries.
5. Make consumer side effects replay-safe.
6. Instrument event lag, failures, and version usage.

## Failure modes
- Event is named like a command but treated as a fact.
- Consumer assumes publisher transaction extends across the broker.
- Schema mirrors ORM records and changes with internal refactors.
- Duplicate event creates duplicate side effects.
- Old consumers break when a producer deploys first.

## Verification
Test schema evolution, duplicate events, replay, out-of-order delivery, consumer restart, and producer/consumer mixed versions.
