// test/handler.contract.test.mjs
// Demonstrates: node-testing (handler unit tests via the Workers runtime
// shape — no real wrangler dev needed; the test mocks env bindings and
// invokes the fetch/scheduled handlers directly).
import test from "node:test";
import assert from "node:assert/strict";

// We import the default export. This requires the test environment to support
// ESM (it does — node --test runs ESM by default in package.json type:module).
const worker = (await import("../src/index.js")).default;

// A fake env binding. Real tests would use @cloudflare/vitest-pool-workers
// against the actual runtime; this smoke test confirms the handler structure.
function makeEnv() {
  return {
    KV: {
      _store: new Map(),
      async get(k) { return this._store.get(k) ?? null; },
      async put(k, v, opts) { this._store.set(k, v); },
      async delete(k) { this._store.delete(k); },
    },
    AI: {
      async run(model, params) {
        // Fake AI: yields 3 fake chunks, then ends.
        const chunks = ["Hello", " world", "!"];
        return {
          async *[Symbol.asyncIterator]() {
            for (const c of chunks) yield { response: c };
          },
        };
      },
    },
    FEATURE_FLAGS: {
      async get(key) { return key === "kill_switch" ? "false" : null; },
    },
    LEADER: {
      // Durable Object stub — would be a real DO namespace via vitest-pool-workers.
      get(id) {
        return {
          async fetch(request) {
            return new Response(JSON.stringify({ acquired: true, leader: id }), {
              headers: { "Content-Type": "application/json" },
            });
          },
        };
      },
    },
  };
}

test("GET /healthz returns 200 ok", async () => {
  const request = new Request("https://example.com/healthz", { method: "GET" });
  const response = await worker.fetch(request, makeEnv(), {});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
});

test("GET /readyz returns 200 ready when KV responds", async () => {
  const request = new Request("https://example.com/readyz", { method: "GET" });
  const response = await worker.fetch(request, makeEnv(), {});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ready");
});

test("GET /readyz returns 503 when KV throws", async () => {
  const env = makeEnv();
  env.KV.get = async () => { throw new Error("KV down"); };
  const request = new Request("https://example.com/readyz", { method: "GET" });
  const response = await worker.fetch(request, env, {});
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.status, "not_ready");
});

test("POST /summarize with empty body returns 400", async () => {
  const request = new Request("https://example.com/summarize", {
    method: "POST",
    body: "{}",
    headers: { "Content-Type": "application/json" },
  });
  const response = await worker.fetch(request, makeEnv(), {});
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, "BAD_REQUEST");
  assert.ok(body.error.correlation_id.length >= 32);
});

test("POST /summarize with oversized text is rejected", async () => {
  const request = new Request("https://example.com/summarize", {
    method: "POST",
    body: JSON.stringify({ text: "x".repeat(20_000), max_tokens: 200 }),
    headers: { "Content-Type": "application/json" },
  });
  const response = await worker.fetch(request, makeEnv(), {});
  assert.equal(response.status, 400);
});

test("POST /summarize with unknown keys is rejected (z.strict)", async () => {
  const request = new Request("https://example.com/summarize", {
    method: "POST",
    body: JSON.stringify({ text: "hello", max_tokens: 100, malicious: "yes" }),
    headers: { "Content-Type": "application/json" },
  });
  const response = await worker.fetch(request, makeEnv(), {});
  assert.equal(response.status, 400);
});

test("POST /summarize streams SSE chunks", async () => {
  const request = new Request("https://example.com/summarize", {
    method: "POST",
    body: JSON.stringify({ text: "hello world this is a test", max_tokens: 50 }),
    headers: { "Content-Type": "application/json" },
  });
  const response = await worker.fetch(request, makeEnv(), {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "text/event-stream");
  // Consume the stream.
  const text = await response.text();
  assert.match(text, /data: \[/);
  assert.match(text, /data: \[DONE\]/);
});

test("POST /summarize returns correlation id in headers", async () => {
  const request = new Request("https://example.com/summarize", {
    method: "POST",
    body: JSON.stringify({ text: "hello", max_tokens: 50 }),
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": "11111111-1111-1111-1111-111111111111",
    },
  });
  const response = await worker.fetch(request, makeEnv(), {});
  assert.equal(response.headers.get("X-Correlation-Id"), "11111111-1111-1111-1111-111111111111");
});

test("unknown route returns 404", async () => {
  const request = new Request("https://example.com/no-such-route", { method: "GET" });
  const response = await worker.fetch(request, makeEnv(), {});
  assert.equal(response.status, 404);
});

test("scheduled() handler runs and writes heartbeat to KV", async () => {
  const env = makeEnv();
  await worker.scheduled({ cron: "* * * * *" }, env, {});
  const heartbeat = await env.KV.get("__cron_heartbeat");
  assert.ok(heartbeat, "heartbeat was written");
  assert.ok(!isNaN(Date.parse(heartbeat)), "heartbeat is a valid ISO date");
});

test("LeaderDO acquire/release flow", async () => {
  const { LeaderDO } = await import("../src/index.js");
  const fakeState = { storage: { _store: new Map(), async put(obj) { Object.assign(this._store, obj); }, async deleteAll() { this._store.clear(); } } };
  const doInstance = new LeaderDO(fakeState, makeEnv());
  // Acquire
  let response = await doInstance.fetch(new Request("https://do/acquire", {
    method: "GET",
    headers: { "x-caller-id": "worker-1" },
  }));
  let body = await response.json();
  assert.equal(body.acquired, true);
  assert.equal(body.leader, "worker-1");
  // Re-acquire while lease is held → not acquired.
  response = await doInstance.fetch(new Request("https://do/acquire", {
    method: "GET",
    headers: { "x-caller-id": "worker-2" },
  }));
  body = await response.json();
  assert.equal(body.acquired, false);
  assert.equal(body.leader, "worker-1");
  // Release by non-leader → 409.
  response = await doInstance.fetch(new Request("https://do/release", {
    method: "GET",
    headers: { "x-caller-id": "worker-2" },
  }));
  assert.equal(response.status, 409);
  // Release by leader → ok.
  response = await doInstance.fetch(new Request("https://do/release", {
    method: "GET",
    headers: { "x-caller-id": "worker-1" },
  }));
  body = await response.json();
  assert.equal(body.released, true);
});
