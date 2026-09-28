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
  for (const name of ["prisma", "drizzle", "bullmq", "redis"]) {
    assert.match(manifest, new RegExp("^  " + name + "$", "m"));
    await access("adapters/" + name + "/SKILL.md");
    await access("adapters/" + name + "/README.md");
  }
});

test("persistence evaluation cases declare observable invariants", async () => {
  for (const corpus of ["database", "transactions", "migrations", "connection-pooling", "redis", "caching", "queues", "message-brokers", "outbox", "transactional-outbox", "adapters"]) {
    const content = await readFile("evals/cases/persistence/" + corpus + ".yml", "utf8");
    assert.match(content, /expected_invariants:/);
  }
});
