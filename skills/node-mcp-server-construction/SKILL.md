---
name: node-mcp-server-construction
description: Use when designing or building an MCP (Model Context Protocol) server in Node.js to expose tools, resources, or prompts to AI coding agents.
---

# Node MCP Server Construction

## Purpose

MCP (Model Context Protocol) is the standard way AI coding agents (Claude Code, Cursor, Cline, Continue) consume external capabilities. A well-built MCP server exposes a small set of focused tools with clear schemas and stable behavior.

## Activate when

- Building a new MCP server (or stdio/HTTP JSON-RPC service) for an agent runtime.
- Adding tools, resources, or prompts to an existing MCP server.
- Diagnosing MCP server timeouts, schema errors, or agent routing issues.
- Choosing between `@modelcontextprotocol/sdk` and a zero-dependency implementation.

## Repository inspection

1. SDK — grep for `@modelcontextprotocol/sdk`. Read the version (frequently breaking).
2. Server entry — grep for `Server`, `McpServer`, `createServer`. Find the server file.
3. Transport — grep for `StdioServerTransport`, `HTTPServerTransport`, `SSEServerTransport`. Confirm the transport matches the runtime (stdio for local, HTTP/SSE for remote).
4. Tools — grep for `tool(`, `setRequestHandler("tools/list")`. List the tool definitions.
5. Resources — grep for `resource(`, `setRequestHandler("resources/list")`. List the resources.
6. Schemas — grep for `z.object`, `inputSchema`. Confirm every tool has a JSON schema (or `zod`).
7. Error handling — grep for `error`, `catch`. Confirm errors are JSON-RPC errors, not exceptions.
8. Process lifecycle — grep for `process.stdin`, `process.stdout`, `process.on("SIGTERM"`.

## Decision rules

| Concern | Rule |
|---|---|
| Tools | Each tool does one thing. Name is a verb (`get_skill`, `route_prompt`, `list_orders`). Description tells the agent when to use it. |
| Input schema | Every tool has a JSON schema (or `zod`). `properties`, `required`, `type` for each parameter. |
| Output schema | Tools return MCP-formatted output: `{ content: [{ type: "text", text: "..." }] }` or `{ content: [{ type: "image", data: "base64", mimeType: "image/png" }] }`. |
| Errors | Use JSON-RPC error codes: -32700 (parse), -32600 (invalid request), -32601 (method not found), -32602 (invalid params), -32603 (internal). |
| Transport | stdio for local CLI tools; HTTP+SSE for remote. Match the agent's expected transport. |
| Lifecycle | Initialize handshake first. `notifications/initialized` after. Then `tools/list` and `tools/call`. |
| Notifications | Server can send `notifications/progress` for long-running tools. Bound the frequency. |
| Concurrency | Tools may run in parallel. Make stateless or use request-scoped state. |
| Secrets | Read from env or stdin handshake; never hard-code. |
| Zero-dep option | For a small tool surface, a hand-written JSON-RPC 2.0 over stdio server is fine and avoids supply-chain concerns. See `lib/mcp-server.mjs` in this pack for a template. |
| Versioning | `initialize` returns `serverInfo.version`. Bump on schema or behavior changes. |
| Documentation | Document the tool list, schemas, and expected behavior in a README. Agents read this to decide when to use the server. |

## Implementation procedure

1. State the tool surface: what capabilities does the agent need? Keep the list short (≤ 10 tools).
2. Pick the SDK: `@modelcontextprotocol/sdk` for full features, zero-dep JSON-RPC for small surfaces.
3. Define each tool: name, description, JSON input schema, handler.
4. Implement the handler: parse params, perform the work, return MCP-formatted output. Catch exceptions and return JSON-RPC errors.
5. Wire transport: stdio for local, HTTP+SSE for remote.
6. Wire lifecycle: `initialize` handshake, `tools/list`, `tools/call`, `notifications/initialized`.
7. Add tests: invoke each tool with valid and invalid params; confirm correct responses and errors.
8. Document the server in a README; include MCP configuration snippets for Claude Code, Cursor, Cline.

## Failure modes

- Tool with no input schema → agent cannot predict what to pass; hallucinates parameters.
- Tool returns a raw object instead of MCP format → agent cannot parse; behavior breaks.
- Exception thrown inside a tool → JSON-RPC connection drops; agent sees a hang.
- Slow tool with no progress notification → agent times out waiting.
- Tool that holds state across calls → race conditions when the agent calls in parallel.
- Schema with `any` type → agent passes garbage; tool crashes at runtime.
- Server does not respond to `initialize` → agent cannot connect.
- Server uses HTTP transport when the agent expects stdio (or vice versa) → connection fails.
- Tool name is a noun, not a verb → agent confuses "what does this do" with "what does this return".

## Verification

- Send `initialize` → confirm protocol version, server info, capabilities.
- Send `tools/list` → confirm the tool definitions match the documented surface.
- Send `tools/call` for each tool with valid params → confirm MCP-formatted output.
- Send `tools/call` with invalid params → confirm -32602 error.
- Send an unknown method → confirm -32601 error.
- Send malformed JSON → confirm -32700 error.
- Test concurrent `tools/call` → confirm no state corruption.
- Test SIGTERM mid-call → confirm graceful shutdown.
- Source references: https://modelcontextprotocol.io/, https://spec.modelcontextprotocol.io/, https://github.com/modelcontextprotocol/typescript-sdk, https://modelcontextprotocol.io/docs/concepts/tools, https://modelcontextprotocol.io/docs/concepts/transports.
