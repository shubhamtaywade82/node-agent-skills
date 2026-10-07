import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-filesystem-safety",
  "node-temp-file-safety",
  "node-path-traversal-defense",
  "node-archive-extraction-safety",
  "node-file-descriptor-lifecycle",
  "node-process-supervision",
  "node-worker-crash-recovery",
  "node-event-loop-diagnostics",
  "node-memory-leak-diagnostics",
  "node-heap-diagnostics",
  "node-log-redaction",
  "node-telemetry-sampling",
  "node-metric-cardinality-control",
  "node-trace-context-propagation",
  "node-api-content-negotiation",
  "node-http-cache-semantics",
  "node-etag-cache-validation",
  "node-api-conditional-requests",
  "node-rate-limit-headers",
  "node-authz-policy-testing",
  "node-access-control-auditing",
  "node-security-regression-testing",
  "node-runtime-feature-detection",
  "node-repository-health",
];

const adapters = ["fastify-swagger","fastify-multipart","nestjs-swagger","opentelemetry-sdk-node"];

test("Wave 13 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/runtime-http-auth-observability/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    const text = await readFile(new URL("../skills/" + skill + "/SKILL.md", import.meta.url), "utf8");
    assert.match(text, new RegExp("^name: " + skill + "$", "m"));
    assert.match(evals, new RegExp("skill: " + skill, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 330);
  assert.equal([...manifest.matchAll(/^    path: adapters\//gm)].length, 81);
});

test("Wave 13 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp("^  " + name + ":\n    path: adapters/" + name + "/SKILL\.md\n    version_scope: .+\n    source: https://", "m"));
    const skill = await readFile(new URL("../adapters/" + name + "/SKILL.md", import.meta.url), "utf8");
    const readme = await readFile(new URL("../adapters/" + name + "/README.md", import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
