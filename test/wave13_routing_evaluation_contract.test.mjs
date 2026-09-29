import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");
const cases = await readFile(new URL("../evals/cases/agent-network-security/workflow.yml", import.meta.url), "utf8");

const registered = new Set([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map(m => m[1]));

test("Wave 13 routing corpus uses registered skill IDs", () => {
  const blocks = cases.split(/^  - name: /m).slice(1);
  assert.equal(blocks.length, 20);
  for (const block of blocks) {
    const skill = block.match(/^    skill: ([a-z0-9-]+)$/m)?.[1];
    assert.ok(skill && registered.has(skill), "unregistered primary skill: " + skill);
    const negatives = block.match(/^    must_not_select: [([^]]+)]$/m)?.[1]
      .split(",").map(x => x.trim().replace(/^"|"$/g, ""));
    assert.ok(negatives?.length >= 2, "each case needs adjacent negative skills");
    for (const negative of negatives) assert.ok(registered.has(negative), "unregistered negative skill: " + negative);
  }
});

test("Wave 13 positive and negative routing signals do not overlap", () => {
  const blocks = cases.split(/^  - name: /m).slice(1);
  for (const block of blocks) {
    const positive = new Set((block.match(/^    routing_signals: [([^]]+)]$/m)?.[1] ?? "")
      .split(",").map(x => x.trim().replace(/^"|"$/g, "")));
    const negative = new Set((block.match(/^    negative_signals: [([^]]+)]$/m)?.[1] ?? "")
      .split(",").map(x => x.trim().replace(/^"|"$/g, "")));
    for (const signal of positive) assert.ok(!negative.has(signal), "overlapping routing signal: " + signal);
  }
});
