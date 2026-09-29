import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-api-compatibility",
  "node-api-contract-migration",
  "node-batch-api-design",
  "node-bulk-operations",
  "node-resource-lifecycle",
  "node-data-retention",
  "node-data-lineage",
  "node-data-quality",
  "node-data-masking",
  "node-encryption-at-rest",
  "node-key-management",
  "node-message-ordering",
  "node-message-deduplication",
  "node-consumer-poison-message",
  "node-dead-letter-queues",
  "node-schema-validation-at-boundary",
  "node-runtime-type-safety",
  "node-package-resolution",
];

const adapters = [
  "ajv",
  "jose",
  "kysely",
  "mongodb-memory-server",
];

test("Wave 10 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/data-api-platform/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 246);
});

test("Wave 10 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp("^  " + name + ":\n    path: adapters/" + name + "/SKILL\.md\n    version_scope: .+\n    source: https://", "m"));
    const skill = await readFile(new URL("../adapters/" + name + "/SKILL.md", import.meta.url), "utf8");
    const readme = await readFile(new URL("../adapters/" + name + "/README.md", import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
