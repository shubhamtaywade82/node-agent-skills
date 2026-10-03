import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-typescript-config-engineering",
  "node-tsconfig-project-references",
  "node-typescript-module-resolution",
  "node-esm-cjs-interoperability",
  "node-package-exports",
  "node-package-imports",
  "node-package-self-reference",
  "node-subpath-patterns",
  "node-dual-package-hazards",
  "node-npm-publishing",
  "node-package-provenance",
  "node-typescript-declaration-publishing",
  "node-lockfile-integrity",
  "node-dependency-confusion-defense",
  "node-install-script-safety",
  "node-postinstall-safety",
  "node-build-cache-integrity",
  "node-source-map-governance",
  "node-runtime-inspector-security",
  "node-diagnostic-reports",
  "node-startup-profiling",
  "node-http2-engineering",
  "node-structured-cloning",
  "node-package-manager-policy",
];

const adapters = ["typescript","tsdown","graphql-codegen","swc-core"];

test("Wave 15 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/typescript-packages-diagnostics/workflow.yml", import.meta.url), "utf8");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 298);
});

test("Wave 15 adapter inventory is complete", () => {
  assert.equal([...manifest.matchAll(/^    path: adapters\//gm)].length, 81);
});

test("Wave 15 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp("^  " + name + ":\n    path: adapters/" + name + "/SKILL\.md\n    version_scope: .+\n    source: https://", "m"));
    const skill = await readFile(new URL("../adapters/" + name + "/SKILL.md", import.meta.url), "utf8");
    const readme = await readFile(new URL("../adapters/" + name + "/README.md", import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
