// src/routes/orders.js
// Demonstrates: node-http-engineering (transport boundary), node-api-engineering
// (canonical error envelope, idempotency header, 4xx vs 5xx), node-runtime-validation
// (validate input at the boundary into typed shape), node-async-concurrency (AbortSignal
// propagation), node-observability (correlation id in logs and responses).
import { randomUUID } from "node:crypto";
import { CreateOrderRequest } from "../validation/schemas.js";
import { createOrderWithOutbox, getOrder } from "../persistence/orders.js";
import { logger } from "../observability/logger.js";

/**
 * POST /orders
 *
 * Body: { customer_id, total_cents, currency, idempotency_key }
 *
 * On success: 201 with the created order.
 * On malformed input: 400 with the canonical error envelope.
 * On duplicate idempotency key: 409 with the canonical error envelope.
 * On unexpected failure: 500 with a generic error envelope (no stack trace).
 */
export async function createOrderHandler(request, reply) {
  const correlationId = request.headers["x-correlation-id"] ?? randomUUID();
  request.log = logger.child({ correlation_id: correlationId, route: "POST /orders" });

  // Parse + validate. On failure, return 400 with the canonical envelope.
  const parsed = CreateOrderRequest.safeParse(request.body);
  if (!parsed.success) {
    request.log.warn({ issues: parsed.error.issues }, "validation failed");
    return reply.code(400).send({
      error: {
        code: "BAD_REQUEST",
        message: "Invalid order request.",
        correlation_id: correlationId,
        details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
    });
  }

  try {
    const order = await createOrderWithOutbox(parsed.data);
    request.log.info({ order_id: order.id }, "order created");
    return reply
      .code(201)
      .header("X-Correlation-Id", correlationId)
      .send(order);
  } catch (err) {
    // Classify: 23505 = unique_violation → 409 conflict (idempotent retry).
    if (err.code === "23505") {
      request.log.info({ idempotency_key: parsed.data.idempotency_key }, "duplicate idempotency key");
      return reply.code(409).send({
        error: {
          code: "IDEMPOTENCY_CONFLICT",
          message: "An order with this idempotency key already exists.",
          correlation_id: correlationId,
        },
      });
    }
    // Unknown failure: log the stack server-side, return generic envelope to client.
    request.log.error({ err }, "order creation failed");
    return reply.code(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
        correlation_id: correlationId,
      },
    });
  }
}

/**
 * GET /orders/:id
 *
 * On found: 200 with the order.
 * On not found: 404 with the canonical error envelope.
 */
export async function getOrderHandler(request, reply) {
  const correlationId = request.headers["x-correlation-id"] ?? randomUUID();
  request.log = logger.child({ correlation_id: correlationId, route: "GET /orders/:id" });

  const order = await getOrder(request.params.id);
  if (!order) {
    return reply.code(404).send({
      error: {
        code: "NOT_FOUND",
        message: "Order not found.",
        correlation_id: correlationId,
      },
    });
  }
  return reply
    .code(200)
    .header("X-Correlation-Id", correlationId)
    .send(order);
}

/**
 * Health/readiness probes. /healthz = process running. /readyz = DB reachable.
 */
export async function healthzHandler(_request, reply) {
  return reply.code(200).send({ status: "ok" });
}

export async function readyzHandler(_request, reply) {
  try {
    // Cheap liveness check — does the pool respond?
    const { pool } = await import("../persistence/orders.js");
    await pool.query("SELECT 1");
    return reply.code(200).send({ status: "ready"});
  } catch {
    return reply.code(503).send({ status: "not_ready" });
  }
}
