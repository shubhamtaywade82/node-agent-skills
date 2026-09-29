import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("design-pattern skill is registered and routed", async () => {
  const manifest = await readFile("skill-manifest.yml", "utf8");
  const routing = await readFile("router/ROUTING_CASES.yml", "utf8");
  assert.match(manifest, /^  - name: node-design-patterns$/m);
  assert.match(routing, /primary: node-design-patterns/);
});
