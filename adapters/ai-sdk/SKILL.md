---
name: ai-sdk
description: Use when a Node.js backend uses the Vercel AI SDK for streaming LLM responses, tool calls, or multi-provider model routing.
---

# Vercel AI SDK Adapter

## Purpose

Translate the framework-neutral LLM-application contract onto the Vercel AI SDK (`ai` package), where `streamText`, `generateText`, `generateObject`, and `streamObject` compose with provider packages (`@ai-sdk/openai`, `@ai-sdk/anthropic`, etc.).

## Activate when

- Detect `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/mistral` in dependencies.
- See `streamText`, `generateText`, `generateObject`, `streamObject` imported from `ai`.

## Repository inspection

1. `package.json` — `ai` version (v3+ breaking changes), provider packages.
2. Model client — `openai("gpt-4o")`, `anthropic("claude-3-5-sonnet")`. Read model name, parameters.
3. Tool definitions — `tool({ ... })` with `zod` input schema. Find the tool list per `streamText`/`generateText` call.
4. Streaming response shape — `toDataStreamResponse()`, `toTextStreamResponse()`. Confirm client format.
5. Object generation — `generateObject({ schema, prompt })`. Confirm `zod` schema and `mode: "json"` or `mode: "tool"`.
6. Multi-step tool calls — `maxSteps` (formerly `maxToolRoundtrips`).

## Decision rules

| Concern | Rule |
|---|---|
| Streaming | `streamText` returns a `StreamTextResult`. Use `toDataStreamResponse()` for the AI SDK data stream protocol. |
| Tool schema | Validate tool input with `zod`. `execute` receives parsed input; never raw. |
| Multi-step | Bound `maxSteps` (typically ≤ 5). Each step is an LLM call + tool execution; unbounded = cost + latency explosion. |
| Object generation | Use `generateObject` for structured output. `mode: "json"` is widely supported; `mode: "tool"` is more reliable for complex schemas. |
| Provider routing | Route by capability: reasoning → Claude, speed → GPT-4o-mini, vision → GPT-4o. Document the routing decision. |
| Cost | Log `usage` (`promptTokens`, `completionTokens`). Cap per-request token usage. |
| Abort | Pass `AbortSignal` from the request. On abort, the stream stops and downstream LLM calls cancel. |
| Error envelope | Wrap provider errors in your canonical error shape. Do not leak `OpenAI.APIError` to the client. |
| Callbacks | `onFinish` for post-completion hooks (logging, persistence). `onStepFinish` for multi-step. |
| Telemetry | Enable `experimental_telemetry` for OpenTelemetry. |

## Implementation procedure

1. Detect the `ai` package and provider packages. Read the version (v3 vs v4 breaking changes).
2. Construct the model client with explicit model name, temperature, max_tokens. Pass `AbortSignal` from the request.
3. Define tools with `zod` input schemas. Each `execute` receives parsed input.
4. Call `streamText` (or `generateText`, `generateObject`, `streamObject` as appropriate). Bound `maxSteps`.
5. Stream the response via `toDataStreamResponse()`. Handle mid-stream errors.
6. Wire `onFinish` for usage logging and persistence.

## Failure modes

- Unbounded `maxSteps` → cost + latency spiral, no termination.
- Tool input without `zod` schema → untyped `execute`, prompt injection bypasses validation.
- Streaming response without `AbortSignal` → client cancels but LLM call continues, cost accrues.
- Object generation with `mode: "json"` on a model that does not support it → runtime error or hallucinated JSON.
- Provider error leaked to client → leaks API key metadata, internal state.
- No `onFinish` callback → no usage logging, no cost visibility.

## Verification

- Run `streamText` end-to-end; confirm tokens stream.
- Inject a bad tool input; confirm `zod` rejects.
- Trigger an abort mid-stream; confirm the LLM call stops and cost stops accruing.
- Run `generateObject` with a complex `zod` schema; confirm parsed output.
- Inspect `onFinish` usage logging.
- Inspect `experimental_telemetry` spans.
- Source references: https://sdk.vercel.ai/docs, https://sdk.vercel.ai/docs/ai-sdk-core/generate-text, https://sdk.vercel.ai/docs/ai-sdk-core/stream-text, https://sdk.vercel.ai/docs/ai-sdk-core/generate-object, https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling.
