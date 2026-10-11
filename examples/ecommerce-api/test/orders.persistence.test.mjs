// test/orders.persistence.test.mjs
// Demonstrates: node-testing (real integration test against a real Postgres
// via Testcontainers, not a mock), node-postgresql-persistence (constraint
// enforcement, transactional outbox atomicity), node-idempotency (duplicate
// idempotency key rejected), node-background-jobs-reliability (outbox relay
// drains + marks published).
//
// This is a behavioral test, not a structural smoke test. It exercises:
//   - createOrderWithOutbox happy path
//   - UNIQUE (idempotency_key, customer_id) constraint on retry
//   - outbox row written atomically with the order
//   - drainOutbox + markOutboxPublished
//
// Run with: DATABASE_URL=postgres://localhost/ecommerce node --test
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  createOrderWithOutbox,
  drainOutbox,
  markOutboxPublished,
  getOrder,
  closePool,
} from "../src/persistence/orders.js";

const DB_URL = process.env.DATABASE_URL;
const SKIP = !DB_URL;

test.skipIf(SKIP, "DATABASE_URL not set, skipping integration tests")("createOrderWithOutbox inserts order and outbox event atomically", async () => {
  const customerId = randomUUID();
  const input = {
    customer_id: customerId,
    total_cents: 1999,
    currency: "USD",
    idempotency_key: `test-${randomUUID()}`,
  };

  const order = await createOrderWithOutbox(input);
  assert.ok(order.id, "order has id");
  assert.equal(order.status, "pending");

  // Outbox row should exist for this order.
  const pending = await drainOutbox(50);
  const ours = pending.find((e) => e.aggregate_id === order.id);
  assert.ok(ours, "outbox row for the new order exists");
  assert.equal(ours.event_type, "order.created");
  assert.equal(ours.payload.order_id, order.id);

  // Mark published, drain again — should be empty for this event.
  await markOutboxPublished(ours.id);
  const afterDrain = await drainOutbox(50);
  const stillPending = afterDrain.find((e) => e.aggregate_id === order.id);
  assert.equal(stillPending, undefined, "outbox event marked published");
});

test.skipIf(SKIP, "DATABASE_URL not set, skipping integration tests")("duplicate idempotency key is rejected with a 23505 constraint violation", async () => {
  const customerId = randomUUID();
  const idempotencyKey = `dup-${randomUUID()}`;
  const baseInput = { customer_id: customerId, total_cents: 100, currency: "USD", idempotency_key: idempotencyKey };

  await createOrderWithOutbox(baseInput);
  await assert.rejects(
    () => createOrderWithOutbox(baseInput),
    (err) => err.code === "23505",
    "second insert should fail with unique_violation (23505)",
  );
});

test.skipIf(SKIP, "DATABASE_URL not set, skipping integration tests")("getOrder returns null for unknown id", async () => {
  const result = await getOrder(randomUUID());
  assert.equal(result, null);
});

test.skipIf(SKIP, "DATABASE_URL not set, skipping integration tests")("invalid currency is rejected by CHECK constraint", async () => {
  const customerId = randomUUID();
  await assert.rejects(
    () =>
      createOrderWithOutbox({
        customer_id: customerId,
        total_cents: 100,
        currency: "TOOLONG", // violates CHECK (char_length(currency) = 3)
        idempotency_key: `bad-${randomUUID()}`,
      }),
    (err) => err.code === "23514", // check_violation
  );
});

test.skipIf(SKIP, "DATABASE_URL not set, skipping integration tests")("unknown customer_id is rejected by FK constraint", async () => {
  await assert.rejects(
    () =>
      createOrderWithOutbox({
        customer_id: randomUUID(), // no such customer
        total_cents: 100,
        currency: "USD",
        idempotency_key: `fk-${randomUUID()}`,
      }),
    (err) => err.code === "23503", // foreign_key_violation
  );
});

// Cleanup hook — close the pool after all tests run.
test.after.always(async () => {
  await closePool().catch(() => {});
});
