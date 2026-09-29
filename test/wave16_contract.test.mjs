import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-agent-task-intent",
  "node-agent-tool-selection",
  "node-agent-tool-contract",
  "node-agent-state-machine",
  "node-agent-context-budgeting",
  "node-agent-replayability",
  "node-agent-deterministic-execution",
  "node-agent-safety-gates",
  "node-agent-human-escalation",
  "node-agent-tool-audit",
  "node-agent-observation-normalization",
  "node-agent-action-approval",
  "node-agent-loop-control",
  "node-prototype-pollution-defense",
  "node-regex-dos-defense",
  "node-json-parse-safety",
  "node-serialization-boundaries",
  "node-vm-isolation-limitations",
  "node-database-statement-timeouts",
  "node-query-cancellation",
  "node-prepared-statement-safety",
  "node-pooler-compatibility",
  "node-transaction-state-monitoring",
  "node-connection-pooler-engineering",
];

const adapters = [
  "typescript-eslint",
  "nodemon",
  "graphql-codegen-client-preset",
  "ts-node",
];

test("Wave 16 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/agent-harness-security-database/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 322);
});

test("Wave 16 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp("^  " + name + ":\n    path: adapters/" + name + "/SKILL\.md\n    version_scope: .+\n    source: https://", "m"));
    const skill = await readFile(new URL("../adapters/" + name + "/SKILL.md", import.meta.url), "utf8");
    const readme = await readFile(new URL("../adapters/" + name + "/README.md", import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
