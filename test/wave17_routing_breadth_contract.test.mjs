import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseRoutingCases } from "../lib/routing-evaluator.mjs";

const casesText = await readFile(
  new URL("../evals/cases/agent-network-security/workflow.yml", import.meta.url),
  "utf8",
);
const manifestText = await readFile(
  new URL("../skill-manifest.yml", import.meta.url),
  "utf8",
);

const registered = new Set(
  [...manifestText.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map((match) => match[1]),
);

test("Wave 17 routing breadth reaches 100 unique primary owners", () => {
  const cases = parseRoutingCases(casesText);
  const primarySkills = new Set(cases.map((caseDefinition) => caseDefinition.skill));

  assert.equal(cases.length, 100);
  assert.equal(primarySkills.size, 100);

  for (const caseDefinition of cases) {
    assert.ok(registered.has(caseDefinition.skill), "unregistered primary: " + caseDefinition.skill);
    assert.ok(Array.isArray(caseDefinition.routing_signals) && caseDefinition.routing_signals.length >= 3, caseDefinition.name);
    assert.ok(Array.isArray(caseDefinition.negative_signals) && caseDefinition.negative_signals.length >= 2, caseDefinition.name);
    assert.ok(Array.isArray(caseDefinition.must_not_select) && caseDefinition.must_not_select.length >= 2, caseDefinition.name);
    assert.ok(caseDefinition.disambiguation && caseDefinition.evidence, caseDefinition.name);
  }
});
