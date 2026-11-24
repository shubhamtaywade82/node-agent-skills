---
name: node-event-driven-architecture
description: Use when introducing domain events, integration events, asynchronous service boundaries, event contracts, or event-driven workflows in Node.js systems.
license: MIT
---

# Event-Driven Architecture

## Purpose

Events communicate facts or commands across failure boundaries. Their ownership, schema, delivery semantics, and replay behavior must be explicit. The core discipline: a fact is immutable information about something that already happened; a command is a request for future work; conflating them is the root of most event-driven incidents.

## Activate when

- Introducing domain/integration events.
- Replacing synchronous service calls with asynchronous messaging.
- Designing event contracts across independently deployed services.

## Boundary with related skills

- Use `node-event-driven-architecture` for event semantics, contracts, and boundaries.
- Use `node-transactional-outbox` for the publish-after-commit mechanism on the producer side.
- Use `node-queues` for queue-backed work execution on the consumer side.
- Use `node-idempotency` for replay-safe consumer side effects.

## Repository inspection

Map event producers/consumers, source-of-truth state, broker, event identity, schema/versioning, ordering, retry/dead-letter behavior, and observability. Establish which topics/queues exist today and which consumer groups have independent failure isolation.

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

Fact versus command test:

```
Fact  order.paid.v1        "An order transitioned to paid at T"      — replay is harmless,
                           consumers react or ignore; the producer owes no outcome.
Cmd  email.send-requested "Please send this email"                   — requires a handler,
                           retries, and dead-lettering; delivery failure is exceptional.
```

Naming: `<aggregate>.<fact>.<version>`. Version in the topic/payload name, additive evolution within a version, new version alongside the old during migration.

## Implementation procedure

1. Define event name, meaning, owner, ID, timestamp semantics, and schema.
2. Decide delivery and ordering guarantees.
3. Publish after durable source state is committed.
4. Validate events at consumer boundaries.
5. Make consumer side effects replay-safe.
6. Instrument event lag, failures, and version usage.

**Reference example** — an integration event contract with versioned envelope, outbox publication, and a replay-safe consumer:

```ts
// events/order-paid.v1.ts — the CONTRACT, owned by the orders context
export const OrderPaidV1 = z.object({
  eventId: z.string().uuid(),          // dedup identity (consumer side)
  occurredAt: z.string().datetime(),   // business time, not broker time
  version: z.literal("1"),
  data: z.object({
    orderId: z.string(),
    tenantId: z.string(),
    totalCents: z.number().int().positive(),
    paymentId: z.string(),
  }),
});
export type OrderPaid = z.infer<typeof OrderPaidV1>;

// PRODUCER: publish after commit via the outbox (never inside the tx's
// connection, never before the source row exists)
export async function markOrderPaid(orderId: OrderId): Promise<void> {
  await db.tx(async (tx) => {
    await tx.exec(`UPDATE orders SET status = 'paid' WHERE id = $1 AND status = 'open'`, [orderId]);
    await tx.insert(OutboxRow, {                       // atomic WITH the state change
      topic: "order.paid.v1",
      payload: OrderPaidV1.parse({
        eventId: crypto.randomUUID(), occurredAt: new Date().toISOString(),
        version: "1",
        data: { orderId, tenantId: ctx.tenantId, totalCents, paymentId },
      }),
    });
  });
}   // the outbox relay drains to the broker AFTER commit; crash-safe

// CONSUMER: validate the boundary, dedupe by eventId, replay-safe effects
export async function handleOrderPaid(raw: unknown, meta: ConsumeMeta): Promise<void> {
  const event = OrderPaidV1.parse(raw);                // unknown in, contract out —
                                                       // malformed events dead-letter, not crash
  const claimed = await dedupe.claim(meta.topic, event.eventId, meta.partitionKey);
  if (!claimed) return;                                // duplicate delivery: no-op

  await loyalty.record(event.data.orderId, event.data.totalCents); // idempotent upsert
}
```

Ordering decision: partition by `orderId` when consumer logic depends on lifecycle order (paid before shipped); accept unordered across aggregates. Never build correctness on broker-global ordering.

## Failure modes

- Event is named like a command but treated as a fact — `order.charge-customer` published as information, consumers refusing to act, no retries, money never captured.
- Consumer assumes publisher transaction extends across the broker — publish-then-commit ordering publishes events for rolled-back state.
- Schema mirrors ORM records and changes with internal refactors — every producer deploy breaks consumers.
- Duplicate event creates duplicate side effects (no eventId dedup; customer double-emailed).
- Old consumers break when a producer deploys first — required fields added, contract version not bumped, no dual-publish migration window.
- Poison messages crash the consumer loop (validation missing; one malformed event halts the partition).
- Global ordering assumption — cross-aggregate sequencing "worked" in dev with one partition.

## Verification

Test schema evolution, duplicate events, replay, out-of-order delivery, consumer restart, and producer/consumer mixed versions. Concretely: (a) evolve V1 → V1.1 additively, old consumer still processes; (b) deliver the same eventId twice → exactly one side effect; (c) replay last 24h of events → state converges (idempotency proof); (d) deliver `shipped` before `paid` for one order → consumer either handles or explicitly dead-letters, never corrupts; (e) run producer V2 alongside consumer V1 during the dual-publish window.
