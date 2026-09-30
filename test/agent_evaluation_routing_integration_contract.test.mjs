import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("agent evaluation skill documents the routing evaluator as the execution path", async () => {
  const content = await readFile("skills/node-agent-evaluation/SKILL.md", "utf8");
  assert.match(content, /npm run eval:routing/);
  assert.match(content, /routing decision/);
  assert.match(content, /machine-readable/);
});

test("evaluation docs define the routing decision JSONL contract", async () => {
  const content = await readFile("evals/README.md", "utf8");
  assert.match(content, /eval:routing/);
  assert.match(content, /"case"/);
  assert.match(content, /"primary"/);
  assert.match(content, /"secondary"/);
  assert.match(content, /ADAPTER_MISMATCH/);
});
