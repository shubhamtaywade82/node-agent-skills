import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const skillCases = [
  ["node-http-engineering", "http"],
  ["node-api-versioning", "api-versioning"],
  ["node-rest-api-design", "rest"],
  ["node-pagination-filtering", "pagination"],
  ["node-idempotency", "idempotency"],
  ["node-openapi", "openapi"],
  ["node-graphql", "graphql"],
  ["node-websockets", "websockets"],
  ["node-webhooks", "webhooks"],
];

for (const [skill, corpus] of skillCases) {
  test(`api skill ${skill} has a registered owner and evaluation corpus`, async () => {
    const manifest = await readFile("skill-manifest.yml", "utf8");
    assert.match(manifest, new RegExp(`^  - name: ${skill}$`, "m"));
    await access(`skills/${skill}/SKILL.md`);
    await access(`evals/cases/api/${corpus}.yml`);
  });
}

test("framework adapter corpus has four version-scoped guides", async () => {
  for (const framework of ["express", "fastify", "nestjs", "hono"]) {
    await access(`adapters/${framework}/SKILL.md`);
    await access(`adapters/${framework}/README.md`);
  }
});

test("API evaluation cases declare observable invariants", async () => {
  for (const corpus of ["http", "api-versioning", "rest", "pagination", "idempotency", "openapi", "graphql", "websockets", "webhooks", "frameworks"]) {
    const content = await readFile(`evals/cases/api/${corpus}.yml`, "utf8");
    assert.match(content, /expected_invariants:/);
  }
});
