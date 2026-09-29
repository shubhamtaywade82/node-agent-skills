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
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 274);
  assert.equal([...manifest.matchAll(/^    path: adapters\//gm)].length, 77);
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


test("Wave 13 evaluation cases apply domain-specific pressure", async () => {
  const evals = await readFile(new URL("../evals/cases/runtime-http-auth-observability/workflow.yml", import.meta.url), "utf8");
  const expected = {
    "filesystem-safety": "symlink", "temp-file-safety": "cleanup", "path-traversal-defense": "canonical",
    "archive-extraction-safety": "zip slip", "file-descriptor-lifecycle": "descriptor", "process-supervision": "SIGTERM",
    "worker-crash-recovery": "worker crash", "event-loop-diagnostics": "event loop lag", "memory-leak-diagnostics": "RSS",
    "heap-diagnostics": "heap snapshot", "log-redaction": "authorization header", "telemetry-sampling": "sampling",
    "metric-cardinality-control": "cardinality", "trace-context-propagation": "traceparent", "api-content-negotiation": "Accept",
    "http-cache-semantics": "Cache-Control", "etag-cache-validation": "ETag", "api-conditional-requests": "If-Match",
    "rate-limit-headers": "Retry-After", "authz-policy-testing": "authorization matrix", "access-control-auditing": "audit event",
    "security-regression-testing": "regression test", "runtime-feature-detection": "feature detection", "repository-health": "health check"
  };
  const cases = [...evals.matchAll(/^  - name: ([a-z0-9-]+)\n    skill: ([a-z0-9-]+)\n    prompt: "([^"]+)"/gm)];
  assert.equal(cases.length, 24);
  const prompts = cases.map(m => m[3].toLowerCase());
  assert.equal(new Set(prompts).size, 24, "Wave 13 prompts must be distinct");
  for (const [, name, skill, prompt] of cases) {
    assert.equal(skill, "node-" + name, name + " must route to its corresponding skill");
    assert.ok(expected[name], "missing evaluation marker definition for " + name);
    assert.ok(prompt.toLowerCase().includes(expected[name].toLowerCase()), name + " lacks domain-specific prompt pressure");
  }
  const pressures = [...evals.matchAll(/^    pressure: \[([^\n]+)\]$/gm)].map(m => m[1]);
  const invariants = [...evals.matchAll(/^    expected_invariants: \[([^\n]+)\]$/gm)].map(m => m[1]);
  assert.equal(pressures.length, 24);
  assert.equal(invariants.length, 24);
  assert.ok(new Set(pressures).size >= 20, "pressure sets are too repetitive");
  assert.ok(new Set(invariants).size >= 20, "invariant sets are too repetitive");
});
