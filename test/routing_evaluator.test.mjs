import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRoutingCase, parseRoutingCases, summarizeRoutingResults } from "../lib/routing-evaluator.mjs";

const sample = `cases:
  - name: rest-endpoint
    skill: node-rest-api-design
    must_not_select: [node-http-engineering, node-testing]
  - name: timeout
    skill: node-http-timeouts
    must_not_select: [node-http-keepalive, node-retry-timeouts]
`;

test("parses routing cases from the repository evaluation YAML shape", () => {
  const cases = parseRoutingCases(sample);
  assert.deepEqual(cases, [
    {
      name: "rest-endpoint",
      skill: "node-rest-api-design",
      must_not_select: ["node-http-engineering", "node-testing"],
    },
    {
      name: "timeout",
      skill: "node-http-timeouts",
      must_not_select: ["node-http-keepalive", "node-retry-timeouts"],
    },
  ]);
});

test("accepts an exact primary routing decision", () => {
  const result = evaluateRoutingCase(
    {
      name: "rest-endpoint",
      skill: "node-rest-api-design",
      must_not_select: ["node-http-engineering"],
    },
    { primary: "node-rest-api-design", secondary: ["node-runtime-validation"] },
    new Set(["node-rest-api-design", "node-runtime-validation", "node-http-engineering"])
  );
  assert.equal(result.pass, true);
  assert.deepEqual(result.errors, []);
});

test("rejects a wrong primary skill and reports a stable machine-readable error", () => {
  const result = evaluateRoutingCase(
    {
      name: "rest-endpoint",
      skill: "node-rest-api-design",
      must_not_select: ["node-http-engineering"],
    },
    { primary: "node-http-engineering", secondary: [] },
    new Set(["node-rest-api-design", "node-http-engineering"])
  );
  assert.equal(result.pass, false);
  assert.ok(result.errors.includes("PRIMARY_MISMATCH"));
});

test("rejects forbidden or unknown secondary selections", () => {
  const result = evaluateRoutingCase(
    {
      name: "rest-endpoint",
      skill: "node-rest-api-design",
      must_not_select: ["node-http-engineering"],
    },
    { primary: "node-rest-api-design", secondary: ["node-http-engineering", "node-not-registered"] },
    new Set(["node-rest-api-design", "node-http-engineering"])
  );
  assert.equal(result.pass, false);
  assert.ok(result.errors.includes("FORBIDDEN_SECONDARY"));
  assert.ok(result.errors.includes("UNKNOWN_SKILL"));
});

test("summarizes corpus results without hiding failures", () => {
  const report = summarizeRoutingResults([
    { case: "ok", pass: true, errors: [], primary: "node-a" },
    { case: "bad", pass: false, errors: ["PRIMARY_MISMATCH"], primary: "node-b" },
  ]);
  assert.deepEqual(report, {
    total: 2,
    passed: 1,
    failed: 1,
    primary_accuracy: 0.5,
    failures: [{ case: "bad", errors: ["PRIMARY_MISMATCH"], primary: "node-b" }],
  });
});
