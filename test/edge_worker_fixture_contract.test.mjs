import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { listAdapters, routePrompt, detectAdapters } from "../lib/skill-loader.mjs";

const FIXTURE_ROOT = path.resolve(import.meta.dirname, "..", "examples", "edge-worker");

test("detect adapters in the edge-worker fixture (zod + vitest)", async () => {
  const adapters = await listAdapters();
  const detected = await detectAdapters(FIXTURE_ROOT, adapters);
  const names = detected.map((a) => a.name).sort();
  // The fixture declares zod + vitest (devDep) + wrangler (devDep, not yet
  // registered as an adapter).
  assert.ok(names.includes("zod"), `zod not detected; got: ${names.join(",")}`);
  assert.ok(names.includes("vitest"), `vitest not detected; got: ${names.join(",")}`);
});

test("route 'edge worker streaming LLM' prompt to llm-streaming or edge-runtime-foundations", async () => {
  const result = await routePrompt(
    "deploy a worker that streams LLM tokens via SSE with abort signal",
    FIXTURE_ROOT,
  );
  assert.ok(
    result.candidates.includes("node-llm-streaming") || result.candidates.includes("node-edge-runtime-foundations"),
    `unexpected candidates: ${result.candidates.join(",")}`,
  );
});

test("route 'health check' prompt to http-engineering or production-runtime", async () => {
  const result = await routePrompt(
    "add a /healthz and /readyz probe with graceful shutdown",
    FIXTURE_ROOT,
  );
  // Multiple skills legitimately route for health/shutdown work; confirm
  // one of the canonical owners wins.
  assert.ok(
    ["node-http-engineering", "node-production-runtime", "node-runtime-foundations", "node-process-supervision", "node-signal-handling", "node-zero-downtime"].includes(result.primary),
    `unexpected primary: ${result.primary}`,
  );
});

test("route 'durable object leader election' prompt to distributed-locks", async () => {
  const result = await routePrompt(
    "use a Durable Object for single-writer leader election with a TTL lease",
    FIXTURE_ROOT,
  );
  assert.ok(
    result.candidates.includes("node-distributed-locks"),
    `unexpected candidates: ${result.candidates.join(",")}`,
  );
});

test("edge-worker fixture package.json declares zod, wrangler, @cloudflare/workers-types", async () => {
  const { readFile } = await import("node:fs/promises");
  const pkg = JSON.parse(await readFile(path.join(FIXTURE_ROOT, "package.json"), "utf8"));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert.ok(allDeps.zod, "zod missing from package.json");
  assert.ok(allDeps.wrangler, "wrangler missing from package.json");
  assert.ok(allDeps["@cloudflare/workers-types"], "@cloudflare/workers-types missing");
});

test("edge-worker fixture has wrangler.toml with bindings", async () => {
  const { readFile } = await import("node:fs/promises");
  const wrangler = await readFile(path.join(FIXTURE_ROOT, "wrangler.toml"), "utf8");
  // Confirm the documented bindings are present.
  assert.match(wrangler, /kv_namespaces/);
  assert.match(wrangler, /durable_objects/);
  assert.match(wrangler, /\[ai\]/);
  assert.match(wrangler, /triggers/); // cron
});
