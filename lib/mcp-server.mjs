#!/usr/bin/env node

/**
 * MCP server (stdio, zero-dependency, JSON-RPC 2.0 over stdio)
 *
 * Exposes three tools to AI coding agents that speak Model Context Protocol:
 *   - get_skill(name)             -> SKILL.md text
 *   - route_prompt(prompt, repo?) -> primary + secondaries + adapters
 *   - list_skills(category?)      -> manifest slice
 *   - list_adapters()             -> adapter registry
 *
 * Usage:
 *   node lib/mcp-server.mjs
 *
 * Wire this into Claude Code / Cursor / Cline MCP configuration:
 *   {
 *     "mcpServers": {
 *       "node-agent-skills": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/node-agent-skills/lib/mcp-server.mjs"]
 *       }
 *     }
 *   }
 *
 * The implementation speaks the MCP 2024-11-05 spec subset: stdio transport,
 * initialize/tools/list/tools/call, plain JSON responses. No external SDK
 * dependency — keeps the pack at zero runtime deps.
 */

import readline from "node:readline";
import {
  listSkills,
  listAdapters,
  loadSkillText,
  routePrompt,
} from "./skill-loader.mjs";

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_NAME = "node-agent-skills";
const SERVER_VERSION = "0.2.0";

const TOOLS = [
  {
    name: "get_skill",
    description:
      "Load the SKILL.md content for a registered skill by name (e.g. 'node-postgresql-persistence').",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Skill name from skill-manifest.yml" },
      },
      required: ["name"],
    },
  },
  {
    name: "route_prompt",
    description:
      "Route a natural-language prompt to the owning primary skill, secondaries, and adapters detected in a target repository. Returns the ordered set of SKILL.md paths an agent should load.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The task or change description" },
        repo: { type: "string", description: "Absolute path to target repo for adapter detection (optional)" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "list_skills",
    description: "List all registered skills, optionally filtered by category.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Optional category filter (architecture, runtime, persistence, etc.)" },
      },
    },
  },
  {
    name: "list_adapters",
    description: "List all registered framework adapters (Express, Fastify, Prisma, etc.).",
    inputSchema: { type: "object", properties: {} },
  },
];

function errorObject(id, code, message, data) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message, ...(data ? { data } : {}) },
  };
}

function resultObject(id, result) {
  return { jsonrpc: "2.0", id, result };
}

async function handleInitialize(payload) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: { tools: {} },
    serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
  };
}

async function handleToolsList() {
  return { tools: TOOLS };
}

async function handleToolsCall(id, params) {
  const name = params?.name;
  const args = params?.arguments ?? {};
  if (name === "get_skill") {
    if (typeof args.name !== "string" || !args.name.trim()) {
      return errorObject(id, -32602, "get_skill requires a 'name' string argument");
    }
    const text = await loadSkillText(args.name);
    if (!text) {
      return errorObject(id, -32602, `skill not found: ${args.name}`);
    }
    return resultObject(id, {
      content: [{ type: "text", text }],
    });
  }
  if (name === "route_prompt") {
    if (typeof args.prompt !== "string" || !args.prompt.trim()) {
      return errorObject(id, -32602, "route_prompt requires a 'prompt' string argument");
    }
    const result = await routePrompt(args.prompt, args.repo ?? null);
    return resultObject(id, {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    });
  }
  if (name === "list_skills") {
    const skills = await listSkills(args.category);
    return resultObject(id, {
      content: [{ type: "text", text: JSON.stringify(skills, null, 2) }],
    });
  }
  if (name === "list_adapters") {
    const adapters = await listAdapters();
    return resultObject(id, {
      content: [{ type: "text", text: JSON.stringify(adapters, null, 2) }],
    });
  }
  return errorObject(id, -32601, `unknown tool: ${name}`);
}

async function dispatch(request) {
  const { id, method, params } = request;
  if (method === "initialize") {
    return resultObject(id, await handleInitialize(params));
  }
  if (method === "initialized" || method === "notifications/initialized") {
    return null; // notification, no response
  }
  if (method === "tools/list") {
    return resultObject(id, await handleToolsList(params));
  }
  if (method === "tools/call") {
    return await handleToolsCall(id, params);
  }
  if (method === "ping") {
    return resultObject(id, {});
  }
  return errorObject(id, -32601, `method not found: ${method}`);
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  for await (const line of rl) {
    if (!line.trim()) continue;
    let request;
    try {
      request = JSON.parse(line);
    } catch {
      process.stdout.write(
        JSON.stringify(errorObject(null, -32700, "parse error")) + "\n",
      );
      continue;
    }
    if (request.id === undefined && request.method) {
      // JSON-RPC notification — no response expected
      await dispatch(request).catch(() => null);
      continue;
    }
    let response;
    try {
      response = await dispatch(request);
    } catch (err) {
      response = errorObject(request.id, -32603, err?.message ?? "internal error");
    }
    if (response) {
      process.stdout.write(JSON.stringify(response) + "\n");
    }
  }
}

main().catch((err) => {
  process.stderr.write(`mcp-server fatal: ${err?.message ?? err}\n`);
  process.exit(1);
});
