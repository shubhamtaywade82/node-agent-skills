---
name: node-transactions
description: Use when implementing database transactions, atomic multi-write operations, transaction callbacks, locking, isolation, or coordinating durable state changes in Node.js applications.
license: MIT
---

# Transactions

## Purpose

Use transactions for atomic state transitions, with explicit ownership, short duration, and predictable failure behavior. A transaction is a correctness tool: it makes a set of writes all-happen-or-none-happen. It is not an error handler, not a batching optimization, and never a container for waiting on the network.

## Activate when

- Multiple writes must commit or roll back as one unit.
- A race condition requires atomic read-modify-write or locking.
- ORM transaction helpers are being introduced or changed.

## Boundary with related skills

- Use `node-transactions` for the atomic unit and its isolation/locking semantics.
- Use `node-transactional-outbox` when the unit must atomically include "an event will be published".
- Use `node-deadlock-diagnostics` for diagnosing observed deadlock/serialization failures.
- Use `node-retry-timeouts` for bounded retry of serialization-class failures surfaced by this skill.

## Repository inspection

Identify the transaction owner, isolation level, transaction timeout, lock behavior, connection pool, retry policy, and all work performed inside the transaction. Read the ORM's transaction helper semantics (callback vs manual commit; what happens when the callback throws; whether nested calls share one connection).

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

Isolation selection guide (PostgreSQL):

| Invariant needed | Level | Note |
|---|---|---|
| Reads inside the unit see a consistent snapshot | REPEATABLE READ | Default choice for read-compute-write units |
| Multi-row constraint no concurrent writer can violate | SERIALIZABLE | Retry serialization failures; see verification |
| Single-row atomic increment/decrement | READ COMMITTED + `UPDATE ... SET x = x + 1` | The row lock serializes writers itself |
| Existence-then-insert uniqueness | READ COMMITTED + UNIQUE constraint | The constraint is the arbiter, not the check |
| Read-only report consistency | REPEATABLE READ, read-only, long | Reports tolerate latency; writers do not |

## Implementation procedure

1. Define the invariant and writes that must commit together.
2. Start the transaction at the boundary that owns the unit of work.
3. Perform only database work plus deterministic computation inside it.
4. Commit before external side effects; publish through an outbox when atomic DB+event behavior is required.
5. Translate serialization/deadlock failures into bounded retries when safe.
6. Test rollback, concurrent access, and deadlock/timeout paths.

**Reference example** — a transfer unit with explicit isolation, ordered locking, and post-commit effects:

```ts
type TransferInput = { from: AccountId; to: AccountId; amountCents: number };

export async function transfer(input: TransferInput): Promise<TransferReceipt> {
  // 1. Deterministic lock order (sorted account ids) prevents the classic
  //    A→B / B→A deadlock between concurrent transfers.
  const [first, second] = [input.from, input.to].sort(compare);

  return await db.tx(async (tx) => {
    // 2. Strongest level the invariant needs — two balances move as one
    await tx.exec("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE, READ WRITE");

    // 3. Lock rows for update: FOR UPDATE is explicit; no network between here and commit
    const fromRow = await tx.queryOne(Account, { id: input.from, forUpdate: true });
    const toRow   = await tx.queryOne(Account, { id: input.to,   forUpdate: true });

    // 4. Invariant enforced in SQL-visible state, not just application logic
    if (fromRow.balanceCents < input.amountCents) {
      throw new InsufficientFundsError(input.from);            // rolls back: nothing written
    }
    if (input.from === input.to) throw new SameAccountError(); // guard degenerate input

    await tx.update(Account, { id: fromRow.id })
      .set({ balanceCents: sql`${Account.balanceCents} - ${input.amountCents}` });
    await tx.update(Account, { id: toRow.id })
      .set({ balanceCents: sql`${Account.balanceCents} + ${input.amountCents}` });

    const receipt = await tx.insert(TransferReceipt, { ...input, status: "committed" });

    // 5. Atomic DB+event: the outbox row commits with the transfer
    await tx.insert(OutboxEvent, {
      type: "transfer.completed",
      payload: { receiptId: receipt.id, from: input.from, to: input.to },
    });
    return receipt;                                            // ORM commits on return
  }, {
    // 6. Serialization-class failures are retryable exactly once at this layer
    retryOn: isSerializationFailure,
    maxRetries: 1,
  });
}
```

The anti-pattern the structure forbids:

```ts
// WRONG: transaction held across outbound network call
await db.tx(async (tx) => {
  await tx.update(Account, ...);
  const charge = await stripe.charges.create({...});   // network INSIDE the unit
  await tx.insert(Receipt, ...);                        // locks held for the HTTP duration
});
// If the process dies between charge() and commit: money moved, DB did not record it.
```

## Failure modes

- Transaction helper is nested implicitly and changes ownership (inner `db.tx` starts a second unit on a second connection while the outer holds locks — self-deadlock or split atomicity).
- HTTP call occurs while a connection is holding locks — pool exhaustion plus deadlock amplification under load.
- Retries execute non-idempotent side effects twice (the anti-pattern above plus a retry wrapper).
- Isolation assumptions differ between local and production databases (SQLite default vs PostgreSQL READ COMMITTED; MySQL REPEATABLE READ semantics).
- Deadlocks are treated as impossible instead of observable and bounded — no retry, no metric.
- `SELECT ... FOR UPDATE` skipped in favor of read-then-write, betting on no concurrent writer.
- Savepoints used as general error recovery — swallowing partial failure instead of failing the unit.
- Long-running transactions from background jobs blocking VACUUM (bloat, not just lock waits).

## Verification

Test commit, rollback, concurrent writers, lock timeout, serialization/deadlock retry, and shutdown while a transaction is active. Concretely: (a) two concurrent transfers A→B and B→A complete without deadlock (ordered locking); (b) a failed invariant rolls back every write (balance unchanged, no receipt row); (c) two writers racing the same row serialize (one waits on the row lock, then proceeds with the committed value); (d) a forced serialization failure retries once and succeeds; (e) kill -9 between business writes and commit leaves no partial state. Run concurrency tests against a real PostgreSQL, not a mocked driver — lock behavior is the feature under test.

## Sources

- https://www.postgresql.org/docs/current/tutorial-transactions.html
- Isolation levels and anomalies: https://www.postgresql.org/docs/current/transaction-iso.html
- Explicit locking (FOR UPDATE, deadlocks, lock ordering): https://www.postgresql.org/docs/current/explicit-locking.html
