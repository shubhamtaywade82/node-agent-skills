import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-module-resolution-diagnostics","node-lockfile-integrity","node-package-manager-diagnostics","node-runtime-feature-detection",
  "node-process-supervision","node-memory-leak-diagnostics","node-heap-diagnostics","node-event-loop-diagnostics",
  "node-log-redaction","node-telemetry-sampling","node-cardinality-control","node-trace-context-propagation",
  "node-codegen-engineering","node-generated-code-review","node-release-notes-engineering","node-maintenance-engineering",
  "node-repository-health","node-deprecation-management","node-backward-compatibility-testing","node-runtime-upgrade-planning"
];

test("Wave 14 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/runtime-diagnostics-compatibility/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 266);
});
