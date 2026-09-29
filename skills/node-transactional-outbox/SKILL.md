---
name: node-transactional-outbox
description: Use when a database mutation and its outgoing event must be committed atomically, especially for event-driven services, integrations, and cross-process workflows.
---

# Transactional Outbox

## Purpose
Make the database transaction the single atomic boundary for business state plus event intent; publication happens after commit.

## Activate when
- A feature needs reliable database-to-event propagation.
- Dual-write code attempts to update PostgreSQL and publish to a broker in one application method.
- Process failure can occur between the two operations.

## Repository inspection
Inspect transaction ownership, outbox schema, unique event IDs, relay mechanism, broker contract, consumer idempotency, and migration/deployment sequence.

## Decision rules
| Concern | Rule |
|---|---|
| Transaction | Persist business mutation and outbox event in the same DB transaction. |
| Publication | Never require broker availability for the source transaction to commit. |
| Event ID | Generate a durable unique event ID within the transaction boundary. |
| Relay | Read only committed rows and publish outside the DB transaction. |
| Duplicate | Relay retries may publish the same event more than once; consumers must deduplicate. |
| Ordering | Use aggregate/key ordering only when relay/broker can preserve the required sequence. |
| Failure | A failed relay blocks delivery, not the already committed business transaction. |

## Implementation procedure
1. Define event contract and durable ID.
2. Add outbox schema and indexes for pending/claimed work.
3. Write source mutation and event row atomically.
4. Relay with bounded concurrency and lease expiry.
5. Record broker acknowledgement and retry transient failures.
6. Reconcile stuck rows and verify consumers are replay-safe.

## Failure modes
- Broker call occurs inside the DB transaction.
- Event row has no unique identity.
- Relay deletes the record before durable acknowledgement.
- Consumer assumes exactly-once delivery.
- Schema migration makes the event unreadable by an older consumer.

## Verification
Test transaction rollback, DB commit plus process crash, relay duplication, broker outage, lease expiry, consumer replay, and mixed-version event schemas.
