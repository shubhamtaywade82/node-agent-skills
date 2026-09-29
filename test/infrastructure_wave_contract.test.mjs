import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const skills = [
  ["node-database-engineering", "database"],
  ["node-transactions", "transactions"],
  ["node-migrations", "migrations"],
  ["node-connection-pooling", "connection-pooling"],
  ["node-redis", "redis"],
  ["node-caching", "caching"],
  ["node-queues", "queues"],
  ["node-message-brokers", "message-brokers"],
  ["node-outbox", "outbox"],
  ["node-transactional-outbox", "transactional-outbox"],
];

for (const [skill, corpus] of skills) {
  test(skill + " has a registered owner and evaluation corpus", async () => {
    const manifest = await readFile("skill-manifest.yml", "utf8");
    assert.match(manifest, new RegExp("^  - name: " + skill + "$", "m"));
    await access("skills/" + skill + "/SKILL.md");
    await access("evals/cases/persistence/" + corpus + ".yml");
  });
}

test("persistence adapters are registered with version scope", async () => {
  const manifest = await readFile("skill-manifest.yml", "utf8");
  const adapters = [
    ["prisma", "7.x/8.x"],
    ["drizzle", "current/v1"],
    ["bullmq", "5.x/6.x"],
    ["redis", "node-redis-5.x"],
  ];
  for (const [name, scope] of adapters) {
    assert.match(manifest, new RegExp("^  " + name + ":$", "m"));
    await access("adapters/" + name + "/SKILL.md");
    await access("adapters/" + name + "/README.md");
    const lines = manifest.split("\n");
    const index = lines.indexOf("  " + name + ":");
    assert.ok(index >= 0);
    assert.equal(lines[index + 1], "    path: adapters/" + name + "/SKILL.md");
    assert.equal(lines[index + 2], "    version_scope: " + scope);
    assert.match(lines[index + 3] ?? "", /^    source: https:\/\//);
  }
});

test("persistence evaluation cases declare observable invariants", async () => {
  for (const corpus of ["database", "transactions", "migrations", "connection-pooling", "redis", "caching", "queues", "message-brokers", "outbox", "transactional-outbox", "adapters"]) {
    const content = await readFile("evals/cases/persistence/" + corpus + ".yml", "utf8");
    assert.match(content, /expected_invariants:/);
  }
});
