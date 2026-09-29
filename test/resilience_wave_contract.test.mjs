import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const skills = [
  ["node-retry-timeouts", "retry-timeouts"],
  ["node-resilience", "resilience"],
  ["node-circuit-breakers", "circuit-breakers"],
  ["node-bulkheads", "bulkheads"],
  ["node-load-shedding", "load-shedding"],
  ["node-backpressure", "backpressure"],
  ["node-rate-limiting", "rate-limiting"],
  ["node-distributed-systems", "distributed-systems"],
  ["node-distributed-locks", "distributed-locks"],
  ["node-event-driven-architecture", "event-driven-architecture"],
  ["node-zero-downtime", "zero-downtime"],
  ["node-database-migrations-production", "database-migrations-production"],
  ["node-incident-engineering", "incident-engineering"],
  ["node-runtime-diagnostics", "runtime-diagnostics"],
  ["node-release-engineering", "release-engineering"],
];

for (const [skill, corpus] of skills) {
  test(skill + " has a registered owner and evaluation corpus", async () => {
    const manifest = await readFile("skill-manifest.yml", "utf8");
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    await access("skills/" + skill + "/SKILL.md");
    await access("evals/cases/reliability/" + corpus + ".yml");
  });
}

test("Wave 2C cross-wave adversarial evaluation exists", async () => {
  const content = await readFile("evals/cases/reliability/cross-wave.yml", "utf8");
  assert.match(content, /expected_invariants:/);
  assert.match(content, /idempotency/);
  assert.match(content, /shutdown/);
});

test("repository contract expects all approved skills", async () => {
  const manifest = await readFile("skill-manifest.yml", "utf8");
  assert.equal([...manifest.matchAll(/^  - name: /gm)].length, 206);
});
