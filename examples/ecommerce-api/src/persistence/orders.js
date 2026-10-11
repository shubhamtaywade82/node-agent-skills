// src/persistence/orders.js
// Demonstrates: node-postgresql-persistence (atomic DB operations, transactional outbox),
// node-distributed-locks (idempotency via UNIQUE constraint), node-async-concurrency
// (one client per transaction, released in finally).
import pg from "pg";

const { Pool } = pg;

// Singleton pool for the process. Sized for a single Node process; in a multi-process
// deployment, divide DB max_connections by process count.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgres://localhost/ecommerce",
  max: Number(process.env.DB_POOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

/**
 * Create an order with a transactional outbox event.
 *
 * @param {{customer_id: string, total_cents: number, currency: string, idempotency_key: string}} input
 * @returns {Promise<{id: string, status: string, created_at: string}>}
 * @throws {import("pg").DatabaseError} on constraint violation (duplicate idempotency key, FK, CHECK)
 */
export async function createOrderWithOutbox(input) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Insert the order. The UNIQUE (idempotency_key, customer_id) constraint guarantees
    // at-most-once insertion for the same idempotency key. Duplicate insert throws
    // constraint violation → transaction rolls back.
    const insertResult = await client.query(
      `INSERT INTO orders (customer_id, total_cents, currency, idempotency_key)
       VALUES ($1, $2, $3, $4)
       RETURNING id, status, created_at`,
      [input.customer_id, input.total_cents, input.currency, input.idempotency_key],
    );
    const order = insertResult.rows[0];

    // Write the outbox event IN THE SAME TRANSACTION. Survives process crash:
    // if we crash here, both the order and the outbox row roll back together.
    await client.query(
      `INSERT INTO outbox (aggregate, aggregate_id, event_type, payload)
       VALUES ('order', $1, 'order.created', $2)`,
      [order.id, JSON.stringify({ order_id: order.id, customer_id: input.customer_id })],
    );

    await client.query("COMMIT");
    return order;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Fetch an order by id. Read-only, no transaction needed.
 *
 * @param {string} orderId UUID
 * @returns {Promise<{id: string, status: string, total_cents: number, currency: string, customer_id: string} | null>}
 */
export async function getOrder(orderId) {
  const result = await pool.query(
    `SELECT id, customer_id, status, total_cents, currency, created_at
     FROM orders WHERE id = $1`,
    [orderId],
  );
  return result.rows[0] ?? null;
}

/**
 * Drain pending outbox events. Called by the relay worker.
 *
 * @param {number} batchSize
 * @returns {Promise<Array<{id: number, aggregate: string, aggregate_id: string, event_type: string, payload: any}>>}
 */
export async function drainOutbox(batchSize = 50) {
  // FOR UPDATE SKIP LOCKED prevents contention between relay workers running in parallel.
  const result = await pool.query(
    `SELECT id, aggregate, aggregate_id, event_type, payload
     FROM outbox
     WHERE published_at IS NULL
     ORDER BY created_at
     LIMIT $1
     FOR UPDATE SKIP LOCKED`,
    [batchSize],
  );
  return result.rows;
}

/**
 * Mark an outbox row as published. Idempotent — safe to call multiple times.
 *
 * @param {number} outboxId
 */
export async function markOutboxPublished(outboxId) {
  await pool.query(`UPDATE outbox SET published_at = now() WHERE id = $1`, [outboxId]);
}

/**
 * Close the pool. Call on graceful shutdown only.
 */
export async function closePool() {
  await pool.end();
}

export { pool };
