import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-cqrs",
  "node-read-models",
  "node-event-sourcing",
  "node-optimistic-concurrency",
  "node-data-reconciliation",
  "node-batch-processing",
  "node-data-import-export",
  "node-database-read-replicas",
  "node-database-sharding",
  "node-data-archival",
  "node-durable-workflows",
  "node-outbound-webhooks",
  "node-task-decomposition",
  "node-context-engineering",
  "node-implementation-planning",
  "node-patch-validation",
  "node-merge-conflict-resolution",
  "node-validation-triage",
  "node-review-feedback",
];

const adapters = [
  "mongodb",
  "mongoose",
  "typeorm",
  "sequelize",
  "mysql2",
  "ioredis",
  "temporal",
  "aws-eventbridge",
  "azure-storage-blob",
  "google-cloud-storage",
];

test("Wave 7 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/data-agent-execution/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp(`^  - name: ${skill}$`, "m"));
    const text = await readFile(new URL(`../skills/${skill}/SKILL.md`, import.meta.url), "utf8");
    assert.match(text, new RegExp(`^name: ${skill}$`, "m"));
    assert.match(evals, new RegExp(`skill: ${skill}`, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 266);
});

test("Wave 7 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    const block = new RegExp(`^  ${name}:\\n    path: adapters/${name}/SKILL\\.md\\n    version_scope: .+\\n    source: https://`, "m");
    assert.match(manifest, block);
    const skill = await readFile(new URL(`../adapters/${name}/SKILL.md`, import.meta.url), "utf8");
    const readme = await readFile(new URL(`../adapters/${name}/README.md`, import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
