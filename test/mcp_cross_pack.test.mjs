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

test("tools/list includes route_cross_pack with its v3 schema", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc("tools/list", {}, 2),
  ]);
  assert.equal(err, "");
  const list = responses.find((r) => r.id === 2);
  const tool = list.result.tools.find((t) => t.name === "route_cross_pack");
  assert.ok(tool, "route_cross_pack tool missing");
  assert.equal(tool.inputSchema.required[0], "prompt");
  assert.ok(tool.inputSchema.properties.file);
  assert.ok(tool.inputSchema.properties.packs);
});

test("tools/call route_cross_pack returns per-pack routing", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc(
      "tools/call",
      {
        name: "route_cross_pack",
        arguments: {
          prompt: "add a migration for the orders table with an index",
          file: "src/order.ts",
        },
      },
      2,
    ),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  const body = JSON.parse(call.result.content[0].text);
  assert.equal(body.active_language, "typescript");
  assert.ok(body.packs.length >= 1);
  assert.ok(body.packs_consulted.includes("node-agent-skills"));
  assert.equal(body.primary.pack, "node-agent-skills");
  assert.equal(typeof body.seam.recommended, "boolean");
});

test("tools/call route_cross_pack requires a prompt", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc("tools/call", { name: "route_cross_pack", arguments: {} }, 2),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  assert.equal(call.error.code, -32602);
  assert.match(call.error.message, /prompt/);
});

test("tools/call route_prompt honors the file argument (v3 language boost)", async () => {
  const { responses, err } = await callServer([
    rpc("initialize", {}, 1),
    rpc(
      "tools/call",
      {
        name: "route_prompt",
        arguments: {
          prompt: "add a migration for the orders table with an index",
          file: "app/models/order.rb",
        },
      },
      2,
    ),
  ]);
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  assert.ok(call);
  const body = JSON.parse(call.result.content[0].text);
  assert.equal(body.active_language, "ruby");
});

test("server honors NODE_AGENT_SKILLS_ROOT for pack root resolution", async () => {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const { responses, err } = await new Promise((resolve, reject) => {
    const proc = spawn("node", [SERVER], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, NODE_AGENT_SKILLS_ROOT: repoRoot },
    });
    const out = [];
    const errOut = [];
    proc.stdout.on("data", (data) => out.push(data));
    proc.stderr.on("data", (data) => errOut.push(data));
    proc.on("error", reject);
    proc.on("close", () => {
      const text = Buffer.concat(out).toString("utf8");
      const responses = text.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
      resolve({ responses, err: Buffer.concat(errOut).toString("utf8") });
    });
    proc.stdin.write(rpc("initialize", {}, 1) + "\n");
    proc.stdin.write(rpc("tools/call", { name: "list_adapters", arguments: {} }, 2) + "\n");
    proc.stdin.end();
  });
  assert.equal(err, "");
  const call = responses.find((r) => r.id === 2);
  const adapters = JSON.parse(call.result.content[0].text);
  assert.equal(adapters.length, 95);
});
