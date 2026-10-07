import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-permission-model",
  "node-async-context-propagation",
  "node-request-context",
  "node-abort-cancellation",
  "node-worker-threads",
  "node-child-process-safety",
  "node-http-body-limits",
  "node-upload-security",
  "node-ssrf-defense",
  "node-cache-key-security",
  "node-tenant-cache-isolation",
  "node-database-index-engineering",
  "node-query-performance",
  "node-lock-contention",
  "node-connection-leak-detection",
  "node-transaction-retry",
  "node-health-check-engineering",
  "node-startup-readiness",
  "node-config-drift-detection",
  "node-generated-code-governance",
];

const adapters = [
  "hapi",
  "mercurius",
];

test("Wave 11 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/runtime-data-security/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 330);
});

test("Wave 11 adapter inventory is complete", () => {
  assert.equal([...manifest.matchAll(/^    path: adapters\//gm)].length, 81);
});

test("Wave 11 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp("^  " + name + ":\n    path: adapters/" + name + "/SKILL\.md\n    version_scope: .+\n    source: https://", "m"));
    const skill = await readFile(new URL("../adapters/" + name + "/SKILL.md", import.meta.url), "utf8");
    const readme = await readFile(new URL("../adapters/" + name + "/README.md", import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
