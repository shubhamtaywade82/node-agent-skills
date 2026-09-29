import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");
const cases = await readFile(new URL("../evals/cases/agent-network-security/workflow.yml", import.meta.url), "utf8");

const registered = new Set([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map(m => m[1]));

const field = (block, name) => block.split("\n").find(line => line.startsWith("    " + name + ":")) ?? "";

test("Wave 13 routing corpus uses registered skill IDs", () => {
  const blocks = cases.split(/^  - name: /m).slice(1);
  assert.equal(blocks.length, 20);
  for (const block of blocks) {
    const skill = field(block, "skill").slice("    skill: ".length).trim();
    assert.ok(skill && registered.has(skill), "unregistered primary skill: " + skill);
    const raw = field(block, "must_not_select");
    assert.match(raw, /^    must_not_select: \[/);
    assert.match(raw, /\]$/);
    const negatives = raw.slice(raw.indexOf("[") + 1, raw.lastIndexOf("]"))
      .split(",").map(x => x.trim().replace(/^"|"$/g, ""));
    assert.ok(negatives.length >= 2, "each case needs adjacent negative skills");
    for (const negative of negatives) assert.ok(registered.has(negative), "unregistered negative skill: " + negative);
  }
});

test("Wave 13 routing cases declare discriminative fields", () => {
  const blocks = cases.split(/^  - name: /m).slice(1);
  for (const block of blocks) {
    for (const name of ["routing_signals", "negative_signals", "evidence"]) {
      const raw = field(block, name);
      assert.match(raw, new RegExp("^    " + name + ": \\["));
      assert.ok(raw.endsWith("]"), name + " must be a list");
    }
    assert.ok(field(block, "disambiguation").length > 25, "disambiguation is too weak");
  }
});

test("Wave 13 positive and negative routing signals do not overlap", () => {
  const blocks = cases.split(/^  - name: /m).slice(1);
  for (const block of blocks) {
    const parse = name => field(block, name).slice(field(block, name).indexOf("[") + 1, field(block, name).lastIndexOf("]"))
      .split(",").map(x => x.trim().replace(/^"|"$/g, ""));
    const positive = new Set(parse("routing_signals"));
    const negative = new Set(parse("negative_signals"));
    for (const signal of positive) assert.ok(!negative.has(signal), "overlapping routing signal: " + signal);
  }
});
