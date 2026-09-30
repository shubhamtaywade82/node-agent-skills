import test from "node:test";
import assert from "node:assert/strict";
import { summarizeRoutingResults } from "../lib/routing-evaluator.mjs";

test("primary accuracy excludes missing and unknown-case submissions", () => {
  const report = summarizeRoutingResults([
    { case: "known", pass: true, errors: [], primary: "node-a" },
    { case: "wrong", pass: false, errors: ["PRIMARY_MISMATCH"], primary: "node-b" },
    { case: "missing", pass: false, errors: ["DECISION_MISSING"], primary: undefined },
    { case: "extra", pass: false, errors: ["UNKNOWN_CASE"], primary: "node-c" },
  ]);

  assert.equal(report.total, 4);
  assert.equal(report.primary_accuracy, 0.5);
});
