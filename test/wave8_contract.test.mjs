import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-disaster-recovery",
  "node-backup-restore",
  "node-chaos-engineering",
  "node-capacity-planning",
  "node-cost-aware-engineering",
  "node-multi-region",
  "node-failover-engineering",
  "node-graceful-degradation",
  "node-time-engineering",
  "node-session-management",
  "node-cookie-security",
  "node-cors-security",
  "node-security-headers",
  "node-ci-pipeline-engineering",
  "node-progressive-delivery",
  "node-infrastructure-as-code",
  "node-observability-validation",
  "node-runbook-engineering",
];

const adapters = [
  "github-actions",
  "terraform",
  "helm",
  "argocd",
  "aws-cloudwatch",
  "sentry",
  "datadog",
  "newrelic",
];

test("Wave 8 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/operations-delivery-security/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp(`^  - name: ${skill}$`, "m"));
    const text = await readFile(new URL(`../skills/${skill}/SKILL.md`, import.meta.url), "utf8");
    assert.match(text, new RegExp(`^name: ${skill}$`, "m"));
    assert.match(evals, new RegExp(`skill: ${skill}`, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 246);
});

test("Wave 8 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    const block = new RegExp(`^  ${name}:\\n    path: adapters/${name}/SKILL\\.md\\n    version_scope: .+\\n    source: https://`, "m");
    assert.match(manifest, block);
    const skill = await readFile(new URL(`../adapters/${name}/SKILL.md`, import.meta.url), "utf8");
    const readme = await readFile(new URL(`../adapters/${name}/README.md`, import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
