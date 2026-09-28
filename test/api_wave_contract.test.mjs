import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const cases = [
  ["http", "node-http-engineering"],
  ["rest", "node-rest-api-design"],
  ["pagination", "node-pagination-filtering"],
  ["idempotency", "node-idempotency"],
  ["protocols", "node-openapi"],
  ["graphql", "node-graphql"],
  ["websockets", "node-websockets"],
  ["webhooks", "node-webhooks"],
];

for (const [name, skill] of cases) {
  test(`api evaluation ${name} has a registered owner`, async () => {
    const manifest = await readFile("skill-manifest.yml", "utf8");
    assert.match(manifest, new RegExp(`^  - name: ${skill}$`, "m"));
    await access(`skills/${skill}/SKILL.md`);
  });
}

test("framework adapter evaluation has all four adapter guides", async () => {
  for (const framework of ["express", "fastify", "nestjs", "hono"]) {
    await access(`adapters/${framework}/SKILL.md`);
  }
});

test("api evaluation corpus declares expected behaviors", async () => {
  const text = await readFile("evals/cases/api/http.yml", "utf8");
  assert.match(text, /expected_invariants:/);
  assert.match(text, /framework-neutral/);
});
