---
name: node-transactions
description: Use when implementing database transactions, atomic multi-write operations, transaction callbacks, locking, isolation, or coordinating durable state changes in Node.js applications.
---

# Transactions

## Purpose
Use transactions for atomic state transitions, with explicit ownership, short duration, and predictable failure behavior.

## Activate when
- Multiple writes must commit or roll back as one unit.
- A race condition requires atomic read-modify-write or locking.
- ORM transaction helpers are being introduced or changed.

## Repository inspection
Identify the transaction owner, isolation level, transaction timeout, lock behavior, connection pool, retry policy, and all work performed inside the transaction.

## Decision rules
| Concern | Rule |
|---|---|
| Owner | One application boundary owns transaction start/commit/rollback. |
| Scope | Keep transactions as short as correctness permits. |
| Network | Do not hold DB transactions open across outbound HTTP, queues, or user interaction. |
| Isolation | Choose the weakest level that satisfies the invariant and document why. |
| Locking | Lock rows only when necessary; order locks consistently to reduce deadlocks. |
| Retry | Retrying a transaction must account for whether enclosed operations are safe to repeat. |
| Nested units | Use savepoints only when partial rollback is a real requirement. |

## Implementation procedure
1. Define the invariant and writes that must commit together.
2. Start the transaction at the boundary that owns the unit of work.
3. Perform only database work plus deterministic computation inside it.
4. Commit before external side effects; publish through an outbox when atomic DB+event behavior is required.
5. Translate serialization/deadlock failures into bounded retries when safe.
6. Test rollback, concurrent access, and deadlock/timeout paths.

## Failure modes
- Transaction helper is nested implicitly and changes ownership.
- HTTP call occurs while a connection is holding locks.
- Retries execute non-idempotent side effects twice.
- Isolation assumptions differ between local and production databases.
- Deadlocks are treated as impossible instead of observable and bounded.

## Verification
Test commit, rollback, concurrent writers, lock timeout, serialization/deadlock retry, and shutdown while a transaction is active.

## Sources
- https://www.postgresql.org/docs/current/tutorial-transactions.html
