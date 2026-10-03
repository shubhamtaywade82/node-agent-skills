import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");
const validator = await readFile(new URL("../scripts/validate.mjs", import.meta.url), "utf8");

const skills = [
  "node-agent-preflight",
  "node-agent-evidence-gathering",
  "node-agent-change-safety",
  "node-agent-verification-reporting",
  "node-agent-risk-escalation",
  "node-agent-rollback-planning",
  "node-agent-commit-hygiene",
  "node-agent-pr-preparation",
  "node-dns-engineering",
  "node-tls-certificate-management",
  "node-http-proxy-forwarding",
  "node-http-timeouts",
  "node-http-keepalive",
  "node-webhook-ingress-security",
  "node-request-signature-validation",
  "node-replay-protection",
  "node-csrf-defense",
  "node-open-redirect-defense",
  "node-request-smuggling-defense",
  "node-header-normalization",
];

const adapters = [
  "graphql-yoga",
  "apollo-server",
];

test("Wave 12 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/agent-network-security/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 298);
});

test("validator derives adapter inventory from the manifest", () => {
  assert.match(validator, /const adapterEntries = \[\];/);
  assert.match(validator, /const manifestLines = manifest\.split/);
  assert.match(validator, /for \(const \{ name, path(?:: adapterPath)?, versionScope, source \} of adapterEntries\)/);
});

test("Wave 12 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp("^  " + name + ":\n    path: adapters/" + name + "/SKILL\.md\n    version_scope: .+\n    source: https://", "m"));
    const skill = await readFile(new URL("../adapters/" + name + "/SKILL.md", import.meta.url), "utf8");
    const readme = await readFile(new URL("../adapters/" + name + "/README.md", import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
