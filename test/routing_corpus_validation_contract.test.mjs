import test from "node:test";
import assert from "node:assert/strict";
import { parseRoutingCases, validateRoutingCorpus } from "../lib/routing-evaluator.mjs";

const skills = new Set(["node-rest-api-design", "node-http-engineering"]);
const adapters = new Set(["adapters/express/SKILL.md"]);

function corpus(source) {
  return parseRoutingCases(source);
}

test("accepts a routing corpus whose primary, secondary, and adapter references are registered", () => {
  const cases = corpus(`cases:
  - name: express
    skill: node-http-engineering
    secondary: [node-rest-api-design]
    adapter: adapters/express/SKILL.md
    must_not_select: []
`);
  assert.deepEqual(validateRoutingCorpus(cases, skills, adapters), []);
});

test("rejects duplicate routing case names", () => {
  const cases = corpus(`cases:
  - name: duplicate
    skill: node-rest-api-design
    must_not_select: []
  - name: duplicate
    skill: node-http-engineering
    must_not_select: []
`);
  assert.ok(validateRoutingCorpus(cases, skills, adapters).includes("DUPLICATE_CASE"));
});

test("rejects an unregistered corpus primary or secondary skill", () => {
  const cases = corpus(`cases:
  - name: invalid-skill
    skill: node-not-registered
    secondary: [node-http-engineering, node-also-missing]
    must_not_select: []
`);
  const errors = validateRoutingCorpus(cases, skills, adapters);
  assert.ok(errors.includes("UNKNOWN_PRIMARY_SKILL"));
  assert.ok(errors.includes("UNKNOWN_SECONDARY_SKILL"));
});

test("rejects an unregistered adapter reference", () => {
  const cases = corpus(`cases:
  - name: invalid-adapter
    skill: node-http-engineering
    adapter: adapters/fastify/SKILL.md
    must_not_select: []
`);
  assert.ok(validateRoutingCorpus(cases, skills, adapters).includes("UNKNOWN_ADAPTER"));
});
