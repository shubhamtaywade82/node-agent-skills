import test from "node:test";
import assert from "node:assert/strict";
import { parseRoutingDecisions } from "../lib/routing-evaluator.mjs";

test("parses JSONL routing decisions deterministically", () => {
  assert.deepEqual(
    parseRoutingDecisions(
      '{"case":"rest","primary":"node-rest-api-design","secondary":[]}\n' +
      '{"case":"timeout","primary":"node-http-timeouts","secondary":[]}\n'
    ),
    new Map([
      ["rest", { case: "rest", primary: "node-rest-api-design", secondary: [] }],
      ["timeout", { case: "timeout", primary: "node-http-timeouts", secondary: [] }],
    ])
  );
});

test("reports duplicate decision case IDs as a stable error", () => {
  assert.deepEqual(
    parseRoutingDecisions(
      '{"case":"rest","primary":"node-rest-api-design","secondary":[]}\n' +
      '{"case":"rest","primary":"node-rest-api-design","secondary":[]}\n'
    ),
    { errors: ["DUPLICATE_DECISION"] }
  );
});

test("reports missing decision case IDs as a stable error", () => {
  assert.deepEqual(
    parseRoutingDecisions('{"primary":"node-rest-api-design","secondary":[]}\n'),
    { errors: ["DECISION_CASE_MISSING"] }
  );
});

test("reports malformed JSONL as a stable error", () => {
  const result = parseRoutingDecisions('{"case":"rest",\n');
  assert.deepEqual(result, { errors: ["DECISION_JSON_INVALID"] });
});
