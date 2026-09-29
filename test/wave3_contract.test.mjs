import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const skills = [
  "node-configuration",
  "node-secrets",
  "node-security-hardening",
  "node-supply-chain",
  "node-package-tooling",
  "node-build-engineering",
  "node-contract-testing",
  "node-property-testing",
  "node-fuzz-testing",
  "node-schema-evolution",
  "node-feature-flags",
  "node-containerization",
  "node-kubernetes",
  "node-serverless",
];

for (const skill of skills) {
  test(skill + " has a registered skill and evaluation corpus", async () => {
    const manifest = await readFile("skill-manifest.yml", "utf8");
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    await access("skills/" + skill + "/SKILL.md");
    await access("evals/cases/platform/" + skill.replace(/^node-/, "") + ".yml");
  });
}

test("Wave 3 adds platform adapters with explicit source metadata", async () => {
  const manifest = await readFile("skill-manifest.yml", "utf8");
  for (const name of ["npm", "docker", "kubernetes", "opentelemetry"]) {
    assert.match(manifest, new RegExp("^  " + name + ":$", "m"));
    assert.match(manifest, new RegExp("^    path: adapters/" + name + "/SKILL\\.md$", "m"));
    assert.match(manifest, /^    source: https:\/\//m);
    await access("adapters/" + name + "/SKILL.md");
    await access("adapters/" + name + "/README.md");
  }
});

test("repository manifest grows to the Wave 3 target", async () => {
  const manifest = await readFile("skill-manifest.yml", "utf8");
  assert.equal([...manifest.matchAll(/^  - name: /gm)].length, 62);
});
