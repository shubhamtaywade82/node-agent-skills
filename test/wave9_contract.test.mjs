import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-sli-slo-engineering",
  "node-error-budget-engineering",
  "node-service-ownership",
  "node-oncall-readiness",
  "node-operational-readiness",
  "node-security-incident-response",
  "node-vulnerability-management",
  "node-auth-session-revocation",
  "node-oauth-client-security",
  "node-oidc-integration",
  "node-mfa-engineering",
  "node-password-storage",
  "node-user-enumeration-defense",
  "node-native-test-runner",
  "node-http-testing",
  "node-benchmark-engineering",
  "node-failure-injection-testing",
  "node-test-isolation-engineering",
];

const adapters = [
  "node-test-runner",
  "supertest",
  "oauth4webapi",
  "openid-client",
];

test("Wave 9 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/identity-slos-test-tooling/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp(`^  - name: ${skill}$`, "m"));
    const text = await readFile(new URL(`../skills/${skill}/SKILL.md`, import.meta.url), "utf8");
    assert.match(text, new RegExp(`^name: ${skill}$`, "m"));
    assert.match(evals, new RegExp(`skill: ${skill}`, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 330);
});

test("Wave 9 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp(`^  ${name}:\\n    path: adapters/${name}/SKILL\\.md\\n    version_scope: .+\\n    source: https://`, "m"));
    const skill = await readFile(new URL(`../adapters/${name}/SKILL.md`, import.meta.url), "utf8");
    const readme = await readFile(new URL(`../adapters/${name}/README.md`, import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
