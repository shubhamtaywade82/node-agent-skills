import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { listAdapters, routePrompt, detectAdapters } from "../lib/skill-loader.mjs";

const FIXTURE_ROOT = path.resolve(import.meta.dirname, "..", "examples", "ecommerce-api");

test("detect adapters in the ecommerce-api fixture", async () => {
  const adapters = await listAdapters();
  const detected = await detectAdapters(FIXTURE_ROOT, adapters);
  const names = detected.map((a) => a.name).sort();
  // The fixture declares fastify, pg, bullmq, zod, pino, ioredis.
  assert.ok(names.includes("fastify"), `fastify not detected; got: ${names.join(",")}`);
  assert.ok(names.includes("pg"), `pg not detected; got: ${names.join(",")}`);
  assert.ok(names.includes("bullmq"), `bullmq not detected; got: ${names.join(",")}`);
  assert.ok(names.includes("zod"), `zod not detected; got: ${names.join(",")}`);
  assert.ok(names.includes("pino"), `pino not detected; got: ${names.join(",")}`);
});

test("route 'transactional outbox' prompt to the owning skill with adapters", async () => {
  const result = await routePrompt(
    "add a transactional outbox for order creation",
    FIXTURE_ROOT,
  );
  // Top candidate should be transactional-outbox or postgresql-persistence.
  assert.ok(
    result.candidates.includes("node-transactional-outbox") || result.candidates.includes("node-postgresql-persistence"),
    `unexpected candidates: ${result.candidates.join(",")}`,
  );
  // Adapters detected from the fixture package.json.
  assert.ok(result.adapters.some((a) => a.name === "fastify"));
  assert.ok(result.adapters.some((a) => a.name === "pg"));
});

test("route 'HTTP middleware' prompt detects the fastify adapter", async () => {
  const result = await routePrompt(
    "add an HTTP middleware for auth and logging on the request lifecycle",
    FIXTURE_ROOT,
  );
  assert.ok(
    ["node-http-engineering", "node-api-engineering", "node-auth-security"].some((s) => s === result.primary),
    `unexpected primary: ${result.primary}`,
  );
  assert.ok(result.adapters.some((a) => a.name === "fastify"));
});

test("route 'queue worker' prompt detects the bullmq adapter", async () => {
  const result = await routePrompt(
    "add a queue worker with retry, backoff, and a dead-letter queue",
    FIXTURE_ROOT,
  );
  assert.ok(
    ["node-background-jobs-reliability", "node-queues"].some((s) => s === result.primary),
    `unexpected primary: ${result.primary}`,
  );
  assert.ok(result.adapters.some((a) => a.name === "bullmq"));
});

test("route 'validate input' prompt detects the zod adapter", async () => {
  const result = await routePrompt(
    "validate the request body at the boundary with a schema",
    FIXTURE_ROOT,
  );
  assert.ok(result.primary !== null, "primary should not be null for a validation prompt");
  assert.ok(result.adapters.some((a) => a.name === "zod"));
});

test("fixture fixture: ecommerce-api has the expected package.json shape", async () => {
  const detected = await detectAdapters(FIXTURE_ROOT, await listAdapters());
  // Confirm at least 5 adapters detected (the fixture declares 6).
  assert.ok(detected.length >= 5, `expected >=5 adapters, got ${detected.length}`);
  // Every detected adapter has a non-empty version_scope (the registry's).
  for (const adapter of detected) {
    assert.ok(adapter.version_scope, `${adapter.name}: version_scope missing`);
    assert.ok(adapter.path.startsWith("adapters/"), `${adapter.name}: path not under adapters/`);
  }
});
