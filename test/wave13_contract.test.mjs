import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { promisify } from "node:util";

const run = promisify(execFile);
const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-skill-pack-format",
  "node-skill-pack-compatibility",
  "node-skill-pack-manifest-governance",
  "node-skill-pack-routing-governance",
  "node-skill-pack-evaluation-governance",
  "node-skill-pack-source-governance",
  "node-skill-pack-versioning",
  "node-skill-pack-release",
  "node-skill-pack-distribution",
  "node-skill-pack-installation",
  "node-agent-progress-tracking",
  "node-agent-task-checkpointing",
  "node-agent-context-budgeting",
  "node-agent-tool-selection",
  "node-agent-command-safety",
  "node-agent-output-contracts",
  "node-agent-handoff",
  "node-agent-recovery",
  "node-agent-multi-file-coordination",
  "node-agent-regression-prevention",
];

test("Wave 13 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/pack-agent-governance/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 246);
});

test("pack exporter produces a self-contained deterministic distribution", async () => {
  const output = await mkdtemp(tmpdir() + "/node-agent-skills-pack-");
  try {
    await run(process.execPath, ["scripts/export-pack.mjs", "--output", output], { cwd: process.cwd() });
    const packageManifest = JSON.parse(await readFile(output + "/pack-manifest.json", "utf8"));
    assert.equal(packageManifest.name, "node-agent-skills");
    assert.equal(packageManifest.skills, 246);
    assert.equal(packageManifest.adapters, 69);
    await readFile(output + "/skill-manifest.yml", "utf8");
    await readFile(output + "/router/ROUTING.md", "utf8");
    await readFile(output + "/README.md", "utf8");
    await readFile(output + "/LICENSE", "utf8");
    await readFile(output + "/checksums.sha256", "utf8");
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
