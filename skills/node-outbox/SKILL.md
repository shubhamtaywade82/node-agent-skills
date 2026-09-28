---
name: node-outbox
description: Use when reliably publishing asynchronous events after database changes, coordinating event relays, or eliminating lost-event windows around process and network failure.
---

# Outbox

## Purpose
The outbox pattern separates durable business state from asynchronous publication while preserving a reliable handoff between them.

## Activate when
- A database write must eventually produce an external event.
- A direct database-write-plus-broker-publish sequence can lose or duplicate events.
- A relay worker is needed for eventual delivery.

## Repository inspection
Find the source database, event schema, relay ownership, publish API, claim/lease strategy, retry state, cleanup policy, and consumer idempotency.

## Decision rules
| Concern | Rule |
|---|---|
| Atomicity | Business state and outbox record must commit together when both are required for correctness. |
| Relay | Publication is asynchronous and may happen more than once. |
| Claiming | Use durable claim/lease semantics safe for worker crashes. |
| Ordering | Define ordering only where the source state and relay can preserve it. |
| Cleanup | Retain enough history for replay/audit while bounding table growth. |
| Consumers | Assume duplicate publication and make consumers idempotent. |

## Implementation procedure
1. Define the event as a durable record.
2. Write business state and outbox row in one transaction.
3. Relay committed rows using bounded claims.
4. Publish outside the source transaction.
5. Mark delivery outcome durably and retry transient failures.
6. Reconcile abandoned leases and support safe replay.

## Failure modes
- Event published before business transaction commits.
- Relay marks sent before provider acknowledgement.
- Crash after publish causes duplicate delivery.
- Cleanup deletes unsent events.
- Relay has no bounded claim/lease and multiple workers publish the same row.

## Verification
Test crash before/after commit, crash before/after publish, duplicate relay, lease expiry, publish outage, replay, and cleanup safety.
