import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRoutingCase } from "../lib/routing-evaluator.mjs";

const registered = new Set([
  "node-http-engineering",
  "node-runtime-validation",
]);

test("accepts the adapter required by an adapter-specific routing case", () => {
  const result = evaluateRoutingCase(
    {
      name: "express-api",
      skill: "node-http-engineering",
      adapter: "adapters/express/SKILL.md",
      must_not_select: ["node-runtime-validation"],
    },
    {
      primary: "node-http-engineering",
      secondary: ["node-runtime-validation"],
      adapter: "adapters/express/SKILL.md",
    },
    registered
  );
  assert.equal(result.pass, true);
});

test("rejects an incorrect adapter selection", () => {
  const result = evaluateRoutingCase(
    {
      name: "express-api",
      skill: "node-http-engineering",
      adapter: "adapters/express/SKILL.md",
      must_not_select: [],
    },
    {
      primary: "node-http-engineering",
      secondary: [],
      adapter: "adapters/fastify/SKILL.md",
    },
    registered
  );
  assert.equal(result.pass, false);
  assert.ok(result.errors.includes("ADAPTER_MISMATCH"));
});

test("rejects a missing adapter when the case requires one", () => {
  const result = evaluateRoutingCase(
    {
      name: "express-api",
      skill: "node-http-engineering",
      adapter: "adapters/express/SKILL.md",
      must_not_select: [],
    },
    {
      primary: "node-http-engineering",
      secondary: [],
    },
    registered
  );
  assert.equal(result.pass, false);
  assert.ok(result.errors.includes("ADAPTER_MISSING"));
});

test("rejects an invented adapter on a framework-neutral case", () => {
  const result = evaluateRoutingCase(
    {
      name: "rest-endpoint",
      skill: "node-http-engineering",
      must_not_select: [],
    },
    {
      primary: "node-http-engineering",
      secondary: [],
      adapter: "adapters/express/SKILL.md",
    },
    registered
  );
  assert.equal(result.pass, false);
  assert.ok(result.errors.includes("UNEXPECTED_ADAPTER"));
});
