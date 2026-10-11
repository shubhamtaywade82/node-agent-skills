---
name: node-tool-calling-patterns
description: Use when designing LLM tool calling in a Node.js backend: tool definitions, schema validation, multi-step loops, parallel tool execution.
---

# Node Tool Calling Patterns

## Purpose

LLM tool calling (also "function calling") lets the model invoke your code. Without explicit schemas, bounded step counts, and validation, tools become a prompt-injection vector and a cost spiral.

## Activate when

- Adding or changing LLM tool definitions.
- Diagnosing prompt injection via tool inputs.
- Diagnosing cost spirals from unbounded multi-step tool loops.
- Choosing between Vercel AI SDK `tool()`, LangChain `Tool`, OpenAI `tools`, Anthropic `tools`.
- Designing parallel tool execution.

## Repository inspection

1. LLM SDK — grep for `ai`, `langchain`, `@anthropic-ai/sdk`, `openai`. Read the version.
2. Tool definitions — grep for `tool(`, `new Tool(`, `tools:`, `functions:`. List the tools per call site.
3. Input schemas — grep for `z.object`, `parameters`, `inputSchema`. Confirm every tool has a `zod` schema or JSON schema.
4. Multi-step — grep for `maxSteps`, `maxToolRoundtrips`, `max_iterations`. Confirm bounded.
5. Tool execution — grep for `execute`, `run`, `handler`. Find the tool execution path.
6. Parallel execution — grep for `Promise.all`, `Promise.allSettled` in the tool execution path.
7. Error handling — grep for `catch`, `onError`. Find how tool errors are surfaced to the LLM.

## Decision rules

| Concern | Rule |
|---|---|
| Tool schema | Every tool has a `zod` input schema. The LLM receives the JSON schema; `execute` receives the parsed value. |
| Tool name | Verb phrase: `get_order`, `send_email`, `refund_charge`. The name tells the LLM what the tool does. |
| Tool description | Tells the LLM when to use the tool, not just what it does. Include preconditions and side effects. |
| Multi-step | Bound `maxSteps` (typically ≤ 5). Each step = LLM call + tool execution. Unbounded = cost + latency spiral. |
| Idempotency | Tools that have side effects (charge, send email) accept an `Idempotency-Key`. The LLM may call the tool twice with the same key. |
| Validation | `zod` schema validates the parsed input. Reject invalid → return the error to the LLM; the LLM can correct and retry. |
| Error to LLM | Return tool errors as structured responses the LLM can reason about: `{ error: "...", recoverable: true/false }`. |
| Parallel execution | If the LLM requests multiple independent tools in one step, execute in parallel via `Promise.allSettled`. |
| Dependencies | If tool B depends on tool A's output, the LLM must call A first, see the result, then call B. Two steps, not one. |
| Sensitive tools | Tools that mutate state (charge, delete, send email) require explicit user confirmation, not just LLM invocation. |
| Observability | Log each tool call: name, input, output, latency. Trace via Langfuse/Langsmith. |
| Cost | Each tool step is an LLM call. Multi-step = N × LLM cost. Bound `maxSteps`. |
| Timeout | Each tool execution has a timeout (≤ 30s). Long-running tools return a "still running" response + a job ID. |

## Implementation procedure

1. List the tools the LLM needs. Keep the list small (≤ 10). Each tool does one thing.
2. Define each tool: name (verb), description (when to use + preconditions + side effects), `zod` input schema, `execute` handler.
3. Implement the `execute` handler: parse input, perform the work, return a structured response. Catch exceptions and return `{ error, recoverable }`.
4. Wire the tool list to the LLM call (`streamText({ tools, maxSteps: 5 })`).
5. Set `maxSteps` (≤ 5) and per-tool timeouts (≤ 30s).
6. Implement parallel execution for independent tools via `Promise.allSettled`.
7. Implement sensitive-tool confirmation: tools that mutate state require explicit user confirmation (UI prompt) before execution.
8. Add observability: log each tool call (name, input, output, latency). Trace via Langfuse/Langsmith.

## Failure modes

- Tool with no input schema → LLM hallucinates parameters; runtime crash.
- Tool name is a noun → LLM confuses "what does this do" with "what does this return".
- `maxSteps` unbounded → cost spiral, no termination.
- Tool error surfaces as exception → LLM cannot recover; the chain breaks.
- Tool timeout infinite → LLM stuck waiting; user-facing latency explodes.
- Parallel execution of dependent tools → race condition, wrong result.
- Sensitive tool executed without confirmation → LLM deletes data, sends emails, charges cards without user consent.
- Tool input not validated → prompt injection passes attacker-controlled input to a sensitive tool.
- Tool output returned as raw string → downstream LLM context-confused, JSON parse fails.

## Verification

- Define a tool; call the LLM with a task that should invoke it; confirm the tool is called with valid input.
- Inject a bad input via prompt injection; confirm `zod` rejects and the error surfaces to the LLM.
- Trigger `maxSteps` exhaustion; confirm the chain terminates.
- Trigger a tool timeout; confirm the LLM receives a "still running" response.
- Trigger parallel tool execution; confirm both complete in one step.
- Trigger dependent tools; confirm the LLM calls A first, then B.
- Trigger a sensitive tool; confirm user confirmation is required.
- Inspect the trace: confirm each tool call is logged with name, input, output, latency.
- Source references: https://platform.openai.com/docs/guides/function-calling, https://docs.anthropic.com/claude/docs/tool-use, https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling, https://js.langchain.com/docs/modules/agents/tools/, https://langfuse.com/docs/tracing-features/agent-runs.
