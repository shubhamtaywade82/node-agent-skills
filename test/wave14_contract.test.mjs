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
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 274);
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


test("Wave 14 evaluation cases apply domain-specific pressure", async () => {
  const evals = await readFile(new URL("../evals/cases/distribution-codegen-database-runtime/workflow.yml", import.meta.url), "utf8");
  const expected = {
    "agent-installation":"pinned","agentskills-compatibility":"Agent Skills","skill-packaging":"reproducible","skill-discovery-contract":"trigger",
    "skill-routing-contract":"primary owner","skill-evaluation-discipline":"negative","skill-version-governance":"version","skill-reference-governance":"HTTPS",
    "codegen-engineering":"generator","generated-schema-contracts":"schema","generated-client-governance":"generated client","generated-artifact-determinism":"deterministic",
    "release-notes-engineering":"breaking","maintenance-engineering":"unmaintained","deprecation-planning":"sunset","change-log-integrity":"changelog",
    "database-advisory-locks":"advisory lock","database-read-replica-routing":"read replica","query-plan-engineering":"EXPLAIN","postgres-locking":"lock",
    "deadlock-diagnostics":"deadlock","isolation-level-selection":"isolation","signal-handling":"SIGTERM","runtime-health-monitoring":"health check"
  };
  const cases = [...evals.matchAll(/^  - name: ([a-z0-9-]+)\n    skill: ([a-z0-9-]+)\n    prompt: "([^"]+)"/gm)];
  assert.equal(cases.length, 24);
  assert.equal(new Set(cases.map(m => m[3])).size, 24);
  for (const [, name, skill, prompt] of cases) {
    assert.equal(skill, "node-" + name);
    assert.ok(prompt.toLowerCase().includes(expected[name].toLowerCase()), name + " lacks domain-specific prompt pressure");
  }
  const pressures = [...evals.matchAll(/^    pressure: \[([^\n]+)\]$/gm)].map(m => m[1]);
  const invariants = [...evals.matchAll(/^    expected_invariants: \[([^\n]+)\]$/gm)].map(m => m[1]);
  assert.equal(pressures.length, 24);
  assert.equal(invariants.length, 24);
  assert.ok(new Set(pressures).size >= 20);
  assert.ok(new Set(invariants).size >= 20);
});

test("Wave 14 skill procedures contain real line breaks", async () => {
  const skills = [
    "node-agent-installation","node-agentskills-compatibility","node-skill-packaging","node-skill-discovery-contract","node-skill-routing-contract","node-skill-evaluation-discipline","node-skill-version-governance","node-skill-reference-governance","node-codegen-engineering","node-generated-schema-contracts","node-generated-client-governance","node-generated-artifact-determinism","node-release-notes-engineering","node-maintenance-engineering","node-deprecation-planning","node-change-log-integrity","node-database-advisory-locks","node-database-read-replica-routing","node-query-plan-engineering","node-postgres-locking","node-deadlock-diagnostics","node-isolation-level-selection","node-signal-handling","node-runtime-health-monitoring"
  ];
  for (const skill of skills) {
    const content = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    const section = content.match(/## Implementation procedure\n\n([\s\S]*?)(?=\n## |\n?$)/);
    assert.ok(section, skill + " has an implementation procedure");
    assert.ok(!section[1].includes("\\n"), skill + " must not contain literal newline escapes");
  }
});
