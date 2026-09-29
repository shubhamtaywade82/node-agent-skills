import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cases = await readFile(new URL("../evals/cases/agent-network-security/workflow.yml", import.meta.url), "utf8");

test("Wave 13 evaluation cases contain discriminative routing signals", () => {
  const blocks = cases.split(/^  - name: /m).slice(1);
  assert.equal(blocks.length, 20);
  const prompts = blocks.map(block => block.match(/^    prompt: "(.+)"$/m)?.[1] ?? "");
  assert.equal(new Set(prompts).size, 20, "each case needs a distinct prompt");
  for (const prompt of prompts) {
    assert.ok(prompt.length >= 80, "prompt is too generic: " + prompt);
  }
});

test("Wave 13 cases declare routing evidence and negative signals", () => {
  const blocks = cases.split(/^  - name: /m).slice(1);
  for (const block of blocks) {
    assert.match(block, /^    routing_signals: [[^]]+]$/m);
    assert.match(block, /^    negative_signals: [[^]]+]$/m);
    assert.match(block, /^    evidence: [[^]]+]$/m);
  }
});

test("Wave 13 cases distinguish adjacent skills", () => {
  const blocks = cases.split(/^  - name: /m).slice(1);
  for (const block of blocks) {
    assert.match(block, /^    disambiguation: /m);
    assert.match(block, /must_not_select:/);
  }
});
