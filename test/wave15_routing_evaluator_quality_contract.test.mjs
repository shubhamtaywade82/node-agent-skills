import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateRoutingCase,
  summarizeRoutingResults,
  validateRoutingCorpus,
} from "../lib/routing-evaluator.mjs";

const registered = new Set([
  "node-rest-api-design",
  "node-http-engineering",
  "node-runtime-validation",
  "node-testing",
]);

test("Wave 15 corpus validation requires discriminative routing metadata", () => {
  const errors = validateRoutingCorpus(
    [{
      name: "incomplete",
      skill: "node-rest-api-design",
      must_not_select: ["node-http-engineering"],
    }],
    registered,
  );

  assert.deepEqual(errors.sort(), [
    "DISAMBIGUATION_MISSING",
    "EVIDENCE_MISSING",
    "NEGATIVE_SIGNALS_MISSING",
    "PROMPT_MISSING",
    "ROUTING_SIGNALS_MISSING",
  ]);
});

test("Wave 15 rejects duplicate secondary skills and primary-secondary duplication", () => {
  const duplicate = evaluateRoutingCase(
    {
      name: "rest-endpoint",
      skill: "node-rest-api-design",
      must_not_select: [],
    },
    {
      primary: "node-rest-api-design",
      secondary: ["node-http-engineering", "node-http-engineering"],
    },
    registered,
  );
  assert.ok(duplicate.errors.includes("DUPLICATE_SECONDARY"));

  const primaryRepeated = evaluateRoutingCase(
    {
      name: "rest-endpoint",
      skill: "node-rest-api-design",
      must_not_select: [],
    },
    {
      primary: "node-rest-api-design",
      secondary: ["node-rest-api-design"],
    },
    registered,
  );
  assert.ok(primaryRepeated.errors.includes("PRIMARY_IN_SECONDARY"));
});

test("Wave 15 reports adapter accuracy and secondary violation rate separately", () => {
  const report = summarizeRoutingResults([
    {
      case: "plain",
      pass: true,
      errors: [],
      primary: "node-rest-api-design",
      adapter: undefined,
      expectedAdapter: undefined,
      secondaryViolation: false,
    },
    {
      case: "adapter-ok",
      pass: true,
      errors: [],
      primary: "node-http-engineering",
      adapter: "adapters/express/SKILL.md",
      expectedAdapter: "adapters/express/SKILL.md",
      secondaryViolation: false,
    },
    {
      case: "adapter-bad",
      pass: false,
      errors: ["ADAPTER_MISMATCH", "FORBIDDEN_SECONDARY"],
      primary: "node-http-engineering",
      adapter: "adapters/fastify/SKILL.md",
      expectedAdapter: "adapters/express/SKILL.md",
      secondaryViolation: true,
    },
  ]);

  assert.equal(report.adapter_accuracy, 0.5);
  assert.equal(report.secondary_violation_rate, 1 / 3);
});
