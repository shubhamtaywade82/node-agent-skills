import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const packageText = await readFile(new URL("../package.json", import.meta.url), "utf8");

function runCli(args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/evaluate-routing.mjs", ...args], { cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", code => resolve({ code, stdout, stderr }));
  });
}

async function withFixture(callback) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "node-agent-routing-"));
  try {
    const cases = `cases:
  - name: rest
    skill: node-rest-api-design
    prompt: "Design a REST resource endpoint with explicit response and error semantics."
    routing_signals: ["resource endpoint", "status code"]
    negative_signals: ["HTTP middleware only"]
    evidence: ["route implementation", "API tests"]
    disambiguation: "The requested unit is resource design, not transport middleware."
    must_not_select: [node-http-engineering]
    expected_invariants: ["stable response contract", "validated boundary"]
  - name: timeout
    skill: node-http-timeouts
    prompt: "Bound an outbound request with an explicit deadline and cancellation path."
    routing_signals: ["deadline", "AbortSignal"]
    negative_signals: ["socket reuse"]
    evidence: ["HTTP client call site", "timeout tests"]
    disambiguation: "The dominant concern is bounded request lifetime, not connection pooling."
    must_not_select: [node-http-keepalive]
    expected_invariants: ["bounded execution", "cancellation propagates"]
`;
    await writeFile(path.join(dir, "cases.yml"), cases);
    return await callback(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("package exposes a deterministic routing evaluation command", () => {
  const packageJson = JSON.parse(packageText);
  assert.equal(packageJson.scripts["eval:routing"], "node scripts/evaluate-routing.mjs");
});

test("CLI evaluates a complete decision corpus", async () => {
  await withFixture(async dir => {
    const decisions = [
      { case: "rest", primary: "node-rest-api-design", secondary: [] },
      { case: "timeout", primary: "node-http-timeouts", secondary: [] },
    ];
    const decisionsPath = path.join(dir, "decisions.jsonl");
    await writeFile(decisionsPath, decisions.map(JSON.stringify).join("\n") + "\n");

    const result = await runCli(["--cases", path.join(dir, "cases.yml"), "--decisions", decisionsPath]);
    assert.equal(result.code, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.deepEqual(
      { total: report.total, passed: report.passed, failed: report.failed },
      { total: 2, passed: 2, failed: 0 }
    );
  });
});

test("CLI rejects decision records for cases outside the evaluation corpus", async () => {
  await withFixture(async dir => {
    const decisions = [
      { case: "rest", primary: "node-rest-api-design", secondary: [] },
      { case: "timeout", primary: "node-http-timeouts", secondary: [] },
      { case: "typoed-case-name", primary: "node-rest-api-design", secondary: [] },
    ];
    const decisionsPath = path.join(dir, "decisions.jsonl");
    await writeFile(decisionsPath, decisions.map(JSON.stringify).join("\n") + "\n");

    const result = await runCli(["--cases", path.join(dir, "cases.yml"), "--decisions", decisionsPath]);
    assert.equal(result.code, 1);
    const report = JSON.parse(result.stdout);
    assert.equal(report.failed, 1);
    assert.deepEqual(report.failures[0].errors, ["UNKNOWN_CASE"]);
    assert.equal(report.failures[0].case, "typoed-case-name");
  });
});

test("CLI fails closed when a corpus case has no submitted decision", async () => {
  await withFixture(async dir => {
    const decisionsPath = path.join(dir, "decisions.jsonl");
    await writeFile(
      decisionsPath,
      JSON.stringify({ case: "rest", primary: "node-rest-api-design", secondary: [] }) + "\n"
    );

    const result = await runCli(["--cases", path.join(dir, "cases.yml"), "--decisions", decisionsPath]);
    assert.equal(result.code, 1);
    const report = JSON.parse(result.stdout);
    assert.equal(report.failed, 1);
    assert.deepEqual(report.failures[0].errors, ["DECISION_MISSING"]);
    assert.equal(report.failures[0].case, "timeout");
  });
});
