import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";

const SERVER = path.resolve(import.meta.dirname, "..", "lib", "mcp-server.mjs");

function rpc(method, params, id) {
  return JSON.stringify({ jsonrpc: "2.0", id, method, params });
}

async function callServer(lines) {
  return new Promise((resolve, reject) => {
    const proc = spawn("node", [SERVER], { stdio: ["pipe", "pipe", "pipe"] });
    const out = [];
    const err = [];
    proc.stdout.on("data", (data) => out.push(data));
    proc.stderr.on("data", (data) => err.push(data));
    proc.on("error", reject);
    proc.on("close", () => {
      const text = Buffer.concat(out).toString("utf8");
      const responses = text
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => JSON.parse(l));
      resolve({ responses, err: Buffer.concat(err).toString("utf8") });
    });
    for (const line of lines) proc.stdin.write(line + "\n");
    proc.stdin.end();
  });
}

test("initialize returns protocol version and server info", async () => {
  const { responses, err } = await callServer([rpc("initialize", {}, 1)]);
  assert.equal(err, "", `stderr not empty: ${err}`);
  assert.equal(responses.length, 1);
  const r = responses[0];
  assert.equal(r.id, 1);
  assert.equal(r.result.protocolVersion, "2024-11-05");
  assert.equal(r.result.serverInfo.name, "node-agent-skills");
});

test("tools/list returns four tools", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc("tools/list", {}, 2),
  ]);
  assert.equal(err, "");
  const list = responses.find((r) => r.id === 2);
  assert.ok(list);
  const names = list.result.tools.map((t) => t.name).sort();
  assert.deepEqual(names, ["get_skill", "list_adapters", "list_skills", "route_prompt"].sort());
});

test("tools/call get_skill returns SKILL.md text", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc("tools/call", { name: "get_skill", arguments: { name: "node-architecture" } }, 2),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  assert.ok(call.result.content[0].text.includes("name: node-architecture"));
});

test("tools/call route_prompt returns primary and candidates", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc(
      "tools/call",
      { name: "route_prompt", arguments: { prompt: "add a Postgres transaction with an index" } },
      2,
    ),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  const body = JSON.parse(call.result.content[0].text);
  assert.equal(body.primary, "node-postgresql-persistence");
  assert.ok(body.candidates.length > 0);
});

test("tools/call list_skills with category filter", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc("tools/call", { name: "list_skills", arguments: { category: "architecture" } }, 2),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  const body = JSON.parse(call.result.content[0].text);
  assert.ok(body.length > 0);
  assert.ok(body.every((s) => s.category === "architecture"));
});

test("tools/call list_adapters returns 81 adapters", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc("tools/call", { name: "list_adapters", arguments: {} }, 2),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  const body = JSON.parse(call.result.content[0].text);
  assert.equal(body.length, 81);
});

test("tools/call get_skill returns error for unknown skill", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc("tools/call", { name: "get_skill", arguments: { name: "no-such-skill" } }, 2),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  assert.ok(call.error, "expected error response");
  assert.equal(call.error.code, -32602);
});

test("invalid JSON returns parse error", async () => {
  const { responses, err } = await callServer(["not-json"]);
  assert.equal(err, "");
  assert.equal(responses.length, 1);
  assert.equal(responses[0].error.code, -32700);
});

test("unknown method returns -32601", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc("no/such/method", {}, 2),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  assert.equal(call.error.code, -32601);
});
