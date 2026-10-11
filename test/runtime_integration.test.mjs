import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { readFile } from "node:fs/promises";

const ROOT = path.resolve(import.meta.dirname, "..");

function run(cmd, args, stdinLines = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
    const out = [];
    const err = [];
    proc.stdout.on("data", (d) => out.push(d));
    proc.stderr.on("data", (d) => err.push(d));
    proc.on("error", reject);
    proc.on("close", (code) => {
      resolve({
        code,
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
      });
    });
    for (const line of stdinLines) proc.stdin.write(line + "\n");
    proc.stdin.end();
  });
}

test("CLI: skills route returns primary skill for a Postgres prompt", async () => {
  const { code, stdout, stderr } = await run("node", [
    "bin/skills.mjs",
    "route",
    "add a Postgres transaction with an index and a connection pool",
  ]);
  assert.equal(code, 0, `stderr: ${stderr}`);
  const result = JSON.parse(stdout);
  assert.equal(result.primary, "node-postgresql-persistence");
  assert.ok(result.candidates.length > 0);
});

test("CLI: skills list with category filter returns expected skills", async () => {
  const { code, stdout, stderr } = await run("node", [
    "bin/skills.mjs",
    "list",
    "--category",
    "architecture",
  ]);
  assert.equal(code, 0, `stderr: ${stderr}`);
  const skills = JSON.parse(stdout);
  assert.ok(skills.length > 0);
  assert.ok(skills.every((s) => s.category === "architecture"));
});

test("CLI: skills show returns SKILL.md content", async () => {
  const { code, stdout, stderr } = await run("node", [
    "bin/skills.mjs",
    "show",
    "node-architecture",
  ]);
  assert.equal(code, 0, `stderr: ${stderr}`);
  assert.match(stdout, /^name: node-architecture$/m);
  assert.match(stdout, /## Purpose/);
});

test("CLI: skills version returns the pack version", async () => {
  const { code, stdout, stderr } = await run("node", ["bin/skills.mjs", "version"]);
  assert.equal(code, 0, `stderr: ${stderr}`);
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  assert.equal(stdout.trim(), pkg.version);
});

test("CLI: skills detect-repo detects adapters in the fixture repo", async () => {
  const { code, stdout, stderr } = await run("node", [
    "bin/skills.mjs",
    "detect-repo",
    path.resolve(import.meta.dirname, "fixtures"),
  ]);
  assert.equal(code, 0, `stderr: ${stderr}`);
  const detected = JSON.parse(stdout);
  const names = detected.map((a) => a.name);
  assert.ok(names.includes("express"));
  assert.ok(names.includes("prisma"));
  assert.ok(names.includes("zod"));
});

test("CLI: skills route returns error code for empty prompt", async () => {
  const { code, stderr } = await run("node", [
    "bin/skills.mjs",
    "route",
    "",
  ]);
  // The CLI rejects an empty prompt with exit code 2.
  assert.equal(code, 2);
  assert.match(stderr, /prompt required/);
});

test("CLI: skills route detects adapters when --repo is provided", async () => {
  const { code, stdout, stderr } = await run("node", [
    "bin/skills.mjs",
    "route",
    "add a Postgres transaction",
    "--repo",
    path.resolve(import.meta.dirname, "fixtures"),
  ]);
  assert.equal(code, 0, `stderr: ${stderr}`);
  const result = JSON.parse(stdout);
  assert.ok(Array.isArray(result.adapters));
  assert.ok(result.adapters.some((a) => a.name === "prisma"));
});

test("MCP server: full end-to-end RPC over stdio", async () => {
  const { code, stdout, stderr } = await run(
    "node",
    ["lib/mcp-server.mjs"],
    [
      JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
      JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
      JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "route_prompt",
          arguments: { prompt: "add a Postgres transaction with an index" },
        },
      }),
      JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "list_skills",
          arguments: { category: "ai" },
        },
      }),
    ],
  );
  assert.equal(code, 0, `stderr: ${stderr}`);
  const lines = stdout.split("\n").filter((l) => l.trim());
  const responses = lines.map((l) => JSON.parse(l));
  assert.equal(responses.length, 4);

  // initialize
  assert.equal(responses[0].id, 1);
  assert.equal(responses[0].result.protocolVersion, "2024-11-05");
  assert.equal(responses[0].result.serverInfo.name, "node-agent-skills");

  // tools/list
  const toolNames = responses[1].result.tools.map((t) => t.name).sort();
  assert.deepEqual(toolNames, ["get_skill", "list_adapters", "list_skills", "route_prompt"].sort());

  // route_prompt
  const routing = JSON.parse(responses[2].result.content[0].text);
  assert.equal(routing.primary, "node-postgresql-persistence");

  // list_skills filtered by category "ai"
  const aiSkills = JSON.parse(responses[3].result.content[0].text);
  assert.ok(aiSkills.length > 0);
  assert.ok(aiSkills.every((s) => s.category === "ai"));
  const aiSkillNames = aiSkills.map((s) => s.name);
  assert.ok(aiSkillNames.includes("node-llm-application-patterns"));
  assert.ok(aiSkillNames.includes("node-rag-patterns"));
  assert.ok(aiSkillNames.includes("node-mcp-server-construction"));
});

test("MCP server: unknown method returns -32601", async () => {
  const { code, stdout, stderr } = await run(
    "node",
    ["lib/mcp-server.mjs"],
    [
      JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
      JSON.stringify({ jsonrpc: "2.0", id: 2, method: "no/such/method", params: {} }),
    ],
  );
  assert.equal(code, 0, `stderr: ${stderr}`);
  const responses = stdout.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  const err = responses.find((r) => r.id === 2);
  assert.equal(err.error.code, -32601);
});

test("MCP server: malformed JSON returns -32700", async () => {
  const { code, stdout, stderr } = await run(
    "node",
    ["lib/mcp-server.mjs"],
    ["not-json"],
  );
  assert.equal(code, 0, `stderr: ${stderr}`);
  const responses = stdout.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  assert.equal(responses[0].error.code, -32700);
});
