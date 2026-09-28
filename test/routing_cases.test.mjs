import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("routing cases reference registered skills", async () => {
  const manifest = await readFile("skill-manifest.yml", "utf8");
  const registered = new Set([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map(m => m[1]));
  const routing = await readFile("router/ROUTING_CASES.yml", "utf8");
  for (const match of routing.matchAll(/(?:primary|secondary): \[?([^\]\n]+)\]?/g)) {
    for (const ref of match[1].split(",").map(x => x.trim()).filter(Boolean)) assert.ok(registered.has(ref), ref);
  }
});
