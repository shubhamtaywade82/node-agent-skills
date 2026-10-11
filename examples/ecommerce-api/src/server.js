// src/server.js
// Demonstrates: node-production-runtime (graceful shutdown, readiness/liveness,
// signal handling), node-http-engineering (one error boundary, one lifecycle),
// node-observability (structured logs + correlation id), node-async-concurrency
// (shutdown drains in-flight before closing).
import Fastify from "fastify";
import {
  createOrderHandler,
  getOrderHandler,
  healthzHandler,
  readyzHandler,
} from "./routes/orders.js";
import { startOutboxRelay, stopOutboxRelay } from "./jobs/outbox-relay.js";
import { closePool } from "./persistence/orders.js";
import { logger } from "./observability/logger.js";

const PORT = Number(process.env.PORT ?? 3000);
const SHUTDOWN_TIMEOUT_MS = Number(process.env.SHUTDOWN_TIMEOUT_MS ?? 30_000);

function buildApp() {
  const app = Fastify({
    logger: false, // we use our own pino instance
    bodyLimit: 64 * 1024, // 64KB — guard against DoS
    connectionTimeout: 30_000,
    genReqId: () => crypto.randomUUID(),
  });

  // Routes
  app.post("/orders", createOrderHandler);
  app.get("/orders/:id", getOrderHandler);
  app.get("/healthz", healthzHandler);
  app.get("/readyz", readyzHandler);

  // Single normalized error boundary — catches sync throws + rejected promises.
  app.setErrorHandler((err, request, reply) => {
    const correlationId = request.headers["x-correlation-id"] ?? request.id;
    logger
      .child({ correlation_id: correlationId, route: `${request.method} ${request.url}` })
      .error({ err: err.message }, "unhandled error");
    reply.code(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
        correlation_id: correlationId,
      },
    });
  });

  return app;
}

let app;
let relayTimer;

async function start() {
  app = buildApp();
  await app.listen({ port: PORT, host: "0.0.0.0" });
  relayTimer = startOutboxRelay();
  logger.info({ port: PORT }, "server started");
}

async function shutdown(signal) {
  logger.info({ signal }, "shutdown triggered");
  // 1. Stop accepting new connections
  app.close().catch((err) => logger.error({ err }, "app.close failed"));
  stopOutboxRelay();
  if (relayTimer) clearInterval(relayTimer);

  // 2. Drain in-flight with a deadline
  const deadline = new Promise((resolve) =>
    setTimeout(resolve, SHUTDOWN_TIMEOUT_MS).unref?.(),
  );
  await Promise.race([
    Promise.allSettled([app.close()]),
    deadline,
  ]);

  // 3. Close pools
  await closePool().catch((err) => logger.error({ err }, "pool close failed"));

  logger.info({ signal }, "shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((err) => {
  logger.error({ err }, "startup failed");
  process.exit(1);
});
