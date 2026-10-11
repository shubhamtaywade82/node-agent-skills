import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadSkillManifestText,
  buildSystemPrompt,
  parseJudgeResponse,
  judgeSingleCase,
  judgeCorpus,
} from "../lib/llm-judge.mjs";
import { parseRoutingCases } from "../lib/routing-evaluator.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Mock ZAI client. Returns canned JSON responses keyed by case name.
// The point of the test is to verify the harness wires correctly:
//   corpus → judge → eval → summary
// without making a real LLM call.
function mockZai(caseResponses) {
  return {
    chat: {
      completions: {
        async create({ messages }) {
          const userMessage = messages.find((m) => m.role === "user")?.content ?? "";
          // Extract the case name from "Case: <name>"
          const caseMatch = userMessage.match(/^Case:\s*([a-z0-9-]+)/m);
          const caseName = caseMatch?.[1] ?? "unknown";
          const canned = caseResponses[caseName];
          if (canned) {
            return {
              choices: [{ message: { content: JSON.stringify(canned) } }],
            };
          }
          // Default: empty response → triggers PARSE_FAILED path.
          return { choices: [{ message: { content: "" } }] };
        },
      },
    },
  };
}

test("loadSkillManifestText returns the full skill list", async () => {
  const skills = await loadSkillManifestText();
  assert.ok(skills.length > 300, `expected >300 skills, got ${skills.length}`);
  for (const s of skills) {
    assert.ok(s.name, "skill has name");
    assert.ok(s.category, `${s.name}: missing category`);
  }
});

test("buildSystemPrompt names every registered skill", async () => {
  const skills = await loadSkillManifestText();
  const prompt = buildSystemPrompt(skills);
  for (const s of skills) {
    assert.ok(prompt.includes(s.name), `system prompt missing skill: ${s.name}`);
  }
  assert.match(prompt, /routing judge/);
  assert.match(prompt, /JSON only/);
});

test("parseJudgeResponse extracts JSON from markdown-fenced response", () => {
  const text = "```json\n{\"case\":\"test\",\"primary\":\"node-architecture\",\"secondary\":[],\"reasoning\":\"test\"}\n```";
  const parsed = parseJudgeResponse(text, "test");
  assert.equal(parsed.case, "test");
  assert.equal(parsed.primary, "node-architecture");
  assert.deepEqual(parsed.secondary, []);
  assert.equal(parsed.reasoning, "test");
});

test("parseJudgeResponse handles prose around JSON", () => {
  const text = "Here is my decision:\n{\"primary\":\"node-testing\"}\nThat's my answer.";
  const parsed = parseJudgeResponse(text, "test");
  assert.equal(parsed.primary, "node-testing");
});

test("parseJudgeResponse returns PARSE_FAILED for empty response", () => {
  const parsed = parseJudgeResponse("", "test");
  assert.equal(parsed.reasoning, "PARSE_FAILED");
});

test("parseJudgeResponse returns JSON_PARSE_FAILED for malformed JSON", () => {
  const parsed = parseJudgeResponse("{not: valid,}", "test");
  assert.equal(parsed.reasoning, "JSON_PARSE_FAILED");
});

test("judgeSingleCase returns a routing decision", async () => {
  const cases = parseRoutingCases(`
  - name: rest-endpoint
    skill: node-rest-api-design
    prompt: "Add a REST endpoint for orders"
  `);
  const zai = mockZai({
    "rest-endpoint": { primary: "node-rest-api-design", secondary: ["node-http-engineering"], reasoning: "REST design owns the endpoint" },
  });
  const skills = await loadSkillManifestText();
  const systemPrompt = buildSystemPrompt(skills);
  const decision = await judgeSingleCase(cases[0], zai, systemPrompt);
  assert.equal(decision.case, "rest-endpoint");
  assert.equal(decision.primary, "node-rest-api-design");
  assert.deepEqual(decision.secondary, ["node-http-engineering"]);
});

test("judgeSingleCase handles LLM call failure", async () => {
  const cases = parseRoutingCases(`
  - name: rest-endpoint
    skill: node-rest-api-design
    prompt: "Add a REST endpoint"
  `);
  const zai = {
    chat: {
      completions: {
        async create() { throw new Error("network down"); },
      },
    },
  };
  const decision = await judgeSingleCase(cases[0], zai, "system prompt");
  assert.match(decision.reasoning, /LLM_CALL_FAILED: network down/);
  assert.equal(decision.primary, "");
});

test("judgeCorpus scores correctly-routed cases as passing", async () => {
  const cases = parseRoutingCases(`
  - name: rest-endpoint
    skill: node-rest-api-design
    prompt: "Add a REST endpoint for orders"
  - name: postgres-tx
    skill: node-postgresql-persistence
    prompt: "Add a Postgres transaction with an index"
  `);
  const zai = mockZai({
    "rest-endpoint": { primary: "node-rest-api-design", secondary: [], reasoning: "" },
    "postgres-tx": { primary: "node-postgresql-persistence", secondary: ["node-testing"], reasoning: "" },
  });
  const summary = await judgeCorpus(cases, zai);
  assert.equal(summary.total, 2);
  assert.equal(summary.passed, 2, `expected 2 passed, got ${summary.passed}: ${JSON.stringify(summary.failures)}`);
  assert.equal(summary.failed, 0);
  assert.equal(summary.primary_accuracy, 1);
});

test("judgeCorpus scores mismatched primary as failure", async () => {
  const cases = parseRoutingCases(`
  - name: rest-endpoint
    skill: node-rest-api-design
    prompt: "Add a REST endpoint"
  `);
  const zai = mockZai({
    "rest-endpoint": { primary: "node-observability", secondary: [], reasoning: "wrong" },
  });
  const summary = await judgeCorpus(cases, zai);
  assert.equal(summary.total, 1);
  assert.equal(summary.passed, 0);
  assert.equal(summary.failed, 1);
  assert.equal(summary.primary_accuracy, 0);
  assert.ok(summary.failures.some((f) => f.errors.includes("PRIMARY_MISMATCH")));
});

test("judgeCorpus respects the limit option", async () => {
  const cases = parseRoutingCases(`
  - name: a
    skill: node-rest-api-design
    prompt: "a"
  - name: b
    skill: node-rest-api-design
    prompt: "b"
  - name: c
    skill: node-rest-api-design
    prompt: "c"
  `);
  const zai = mockZai({
    "a": { primary: "node-rest-api-design", secondary: [], reasoning: "" },
    "b": { primary: "node-rest-api-design", secondary: [], reasoning: "" },
    "c": { primary: "node-rest-api-design", secondary: [], reasoning: "" },
  });
  const summary = await judgeCorpus(cases, zai, { limit: 2 });
  assert.equal(summary.total, 2);
});

test("scripts/eval-llm-judge.mjs exists and imports cleanly", async () => {
  const scriptText = await readFile(path.join(ROOT, "scripts", "eval-llm-judge.mjs"), "utf8");
  assert.match(scriptText, /judgeCorpus/);
  assert.match(scriptText, /z-ai-web-dev-sdk/);
  assert.match(scriptText, /--cases/);
});

test("llm-judge module exports the expected surface", async () => {
  const mod = await import("../lib/llm-judge.mjs");
  assert.equal(typeof mod.loadSkillManifestText, "function");
  assert.equal(typeof mod.buildSystemPrompt, "function");
  assert.equal(typeof mod.parseJudgeResponse, "function");
  assert.equal(typeof mod.judgeSingleCase, "function");
  assert.equal(typeof mod.judgeCorpus, "function");
});
