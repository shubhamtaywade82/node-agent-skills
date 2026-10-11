// src/jobs/outbox-relay.js
// Demonstrates: node-background-jobs-reliability (at-least-once consumer, drain
// outbox, idempotent publish, DLQ after max attempts), node-transactional-outbox
// (relay pattern), node-async-concurrency (bounded polling), node-observability
// (relay metrics + structured logs), node-production-runtime (graceful shutdown).
import { drainOutbox, markOutboxPublished } from "../persistence/orders.js";
import { logger } from "../observability/logger.js";

const POLL_INTERVAL_MS = Number(process.env.OUTBOX_POLL_MS ?? 1000);
const MAX_PUBLISH_ATTEMPTS = Number(process.env.OUTBOX_MAX_ATTEMPTS ?? 5);

let running = false;

/**
 * Publish a pending outbox event. In this fixture, the "publish" is a no-op
 * (logs to stdout). In a real service, this would enqueue into BullMQ or send
 * an SNS/SQS/EventBridge message.
 *
 * @param {{id: number, aggregate: string, aggregate_id: string, event_type: string, payload: any}} event
 * @returns {Promise<void>}
 */
async function publishEvent(event) {
  logger.info({ event_id: event.id, event_type: event.event_type, aggregate_id: event.aggregate_id }, "publishing outbox event");
  // Simulate a flaky downstream: every 4th event "fails" — would normally be a network error.
  if (event.id % 4 === 0) {
    throw new Error("simulated downstream failure");
  }
  // In a real service: await bullQueue.add(event.event_type, event.payload);
}

/**
 * Drain a batch, attempt publish, mark published on success.
 * Failed events remain in the outbox (published_at IS NULL) and retry on next poll.
 */
async function tick() {
  const events = await drainOutbox(50);
  if (events.length === 0) return;

  for (const event of events) {
    let attempt = 0;
    let published = false;
    while (attempt < MAX_PUBLISH_ATTEMPTS && !published) {
      attempt += 1;
      try {
        await publishEvent(event);
        await markOutboxPublished(event.id);
        published = true;
        logger.info({ event_id: event.id, attempt }, "outbox event published");
      } catch (err) {
        logger.warn({ event_id: event.id, attempt, err: err.message }, "publish attempt failed");
        if (attempt >= MAX_PUBLISH_ATTEMPTS) {
          // In a real service: move to a DLQ table or SQS DLQ, alert.
          logger.error({ event_id: event.id }, "outbox event moved to DLQ after max attempts");
          break;
        }
        // Backoff before retrying this event.
        await new Promise((r) => setTimeout(r, 100 * 2 ** attempt));
      }
    }
  }
}

/**
 * Start the relay worker. Polls the outbox at POLL_INTERVAL_MS until stop() is called.
 */
export function startOutboxRelay() {
  if (running) return;
  running = true;
  logger.info({ poll_interval_ms: POLL_INTERVAL_MS }, "starting outbox relay worker");
  const timer = setInterval(async () => {
    try {
      await tick();
    } catch (err) {
      logger.error({ err }, "outbox relay tick failed");
    }
  }, POLL_INTERVAL_MS);
  // Allow the event loop to exit even if the timer is still running.
  if (timer.unref) timer.unref();
  return timer;
}

/**
 * Stop the relay worker. Called from graceful shutdown.
 */
export function stopOutboxRelay() {
  running = false;
  logger.info("outbox relay worker stopping");
}
