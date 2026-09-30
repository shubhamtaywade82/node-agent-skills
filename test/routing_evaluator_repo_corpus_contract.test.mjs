import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  parseRoutingCases,
  validateRoutingCorpus,
} from "../lib/routing-evaluator.mjs";

test("strict evaluation validation accepts the repository routing corpus", async () => {
  const [casesText, manifestText] = await Promise.all([
    readFile("evals/cases/agent-network-security/workflow.yml", "utf8"),
    readFile("skill-manifest.yml", "utf8"),
  ]);

  const cases = parseRoutingCases(casesText);
  const registeredSkills = new Set(
    [...manifestText.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map((match) => match[1])
  );
  const registeredAdapters = new Set(
    [...manifestText.matchAll(/^    path: (adapters\/[^\n]+)$/gm)].map((match) => match[1].trim())
  );

  assert.deepEqual(
    validateRoutingCorpus(cases, registeredSkills, registeredAdapters, {
      requireEvaluationMetadata: true,
    }),
    []
  );
});
