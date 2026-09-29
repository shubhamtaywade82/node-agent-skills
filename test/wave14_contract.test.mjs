import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-agent-installation",
  "node-agentskills-compatibility",
  "node-skill-packaging",
  "node-skill-discovery-contract",
  "node-skill-routing-contract",
  "node-skill-evaluation-discipline",
  "node-skill-version-governance",
  "node-skill-reference-governance",
  "node-codegen-engineering",
  "node-generated-schema-contracts",
  "node-generated-client-governance",
  "node-generated-artifact-determinism",
  "node-release-notes-engineering",
  "node-maintenance-engineering",
  "node-deprecation-planning",
  "node-change-log-integrity",
  "node-database-advisory-locks",
  "node-database-read-replica-routing",
  "node-query-plan-engineering",
  "node-postgres-locking",
  "node-deadlock-diagnostics",
  "node-isolation-level-selection",
  "node-signal-handling",
  "node-runtime-health-monitoring",
];

const adapters = ["tsx","tsup","esbuild","graphql-request"];

test("Wave 14 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/distribution-codegen-database-runtime/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 322);
});

test("Wave 14 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp("^  " + name + ":\n    path: adapters/" + name + "/SKILL\.md\n    version_scope: .+\n    source: https://", "m"));
    const skill = await readFile(new URL("../adapters/" + name + "/SKILL.md", import.meta.url), "utf8");
    const readme = await readFile(new URL("../adapters/" + name + "/README.md", import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
