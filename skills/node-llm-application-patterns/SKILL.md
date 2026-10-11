---
name: node-llm-application-patterns
description: Use when designing or changing Node.js backends that integrate LLMs (large language models) for chat, summarization, extraction, classification, or tool-calling.
---

# Node LLM Application Patterns

## Purpose

LLM applications have a distinct shape: prompts, completions, tokens, tools, context windows, and probabilistic outputs. They need contracts that bound cost, latency, and correctness — not just API calls.

## Activate when

- Adding or changing LLM-driven features: chat, summarization, extraction, classification, code generation, tool calling.
- Choosing between providers (OpenAI, Anthropic, Google, Mistral, open-source via Ollama/vLLM).
- Choosing between SDKs (Vercel AI SDK, LangChain.js, Anthropic SDK, OpenAI SDK direct).
- Diagnosing hallucination, prompt injection, cost overruns, or latency spikes in LLM calls.

## Repository inspection

1. LLM SDK — grep for `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`, `ai` (Vercel), `langchain`, `@langchain/`. Read the version.
2. Model usage — find every `chat.completions.create`, `client.messages.create`, `streamText`, `generateText`, `generateObject`. List the models and parameters.
3. Prompt templates — grep for `system:`, `messages:`, `ChatPromptTemplate`. Find the canonical prompts per feature.
4. Token usage — grep for `usage`, `prompt_tokens`, `completion_tokens`. Confirm usage is logged per call.
5. Tool definitions — grep for `tool(`, `tools:`, `functions:`. Find the tool list and the input schemas.
6. Caching — grep for `cache`, `cacheKey`, `LRUCache`. Find whether LLM responses are cached.
7. Streaming — grep for `streamText`, `stream: true`. Find the streaming response shape.
8. Guardrails — grep for `validate`, `moderate`, `safety`. Find input/output validation.

## Decision rules

| Concern | Rule |
|---|---|
| Provider routing | Route by capability: reasoning → Claude, speed → GPT-4o-mini, vision → GPT-4o. Document the routing decision per feature. |
| Temperature | 0 for extraction/classification/code. 0.7 for chat. Document per feature. |
| Max tokens | Set explicit `max_tokens` per call. Unbounded = cost runaway. |
| Context window | Bound input tokens. Trim history, summarize older turns, drop irrelevant context. |
| Streaming | Stream tokens to the client via SSE or AI SDK data stream. Buffer client writes; flush on token boundary. |
| Tool calling | Validate tool inputs with `zod`. Bound `maxSteps` (≤ 5). Each step = LLM call + tool execution. |
| Caching | Cache semantically equivalent prompts. Cache key = prompt + model + temperature. TTL ≥ 24h. |
| Guardrails | Input validation (prompt injection detection), output validation (schema match, hallucination check). |
| Cost | Log usage per call. Cap per-request and per-tenant token usage. Alert on budget burn. |
| Latency | p99 ≤ 30s for chat, ≤ 60s for tool-augmented. Set per-call timeout ≤ the SLA. |
| Idempotency | Mutations that may retry (charge, send email) accept `Idempotency-Key`. LLM call is part of the idempotency scope. |
| Errors | Wrap provider errors in your canonical error shape. Retry only idempotent calls. |
| Observability | Log prompt + completion + usage + latency per call. Trace via Langfuse/Langsmith or OpenTelemetry. |
| Fallback | On rate limit or 5xx from primary provider, fall back to a secondary (GPT-4o → Claude). |

## Implementation procedure

1. State the LLM use case: chat, summarization, extraction, classification, code generation, tool calling.
2. Pick the provider and model. Document the routing decision.
3. Write the prompt template. Version it (v1, v2). Test against golden outputs.
4. Set parameters: temperature, max_tokens, timeout, max_steps (for tool calling).
5. Implement guardrails: input validation, output validation, prompt injection detection.
6. Add observability: usage logging, latency, trace via Langfuse/Langsmith.
7. Add cost control: per-request and per-tenant token caps, alerting on burn.
8. Add caching for semantically equivalent prompts.
9. Add a fallback provider.
10. Test under failure: provider 5xx, rate limit, timeout, bad output (schema mismatch).

## Failure modes

- Unbounded `max_tokens` → cost runaway, response time 60s.
- No context window trimming → token limit exceeded, call fails or truncates silently.
- Prompt injection → tool called with attacker-controlled input, leak or destructive action.
- No hallucination check → user acts on fabricated facts (citations, prices, code).
- No caching → same prompt recomputed 1000×, cost explodes.
- Provider 5xx not retried or not fallen back → user-facing error.
- Streaming response without error handling → mid-stream failure breaks the client.
- Tool input without `zod` schema → untyped `execute`, prompt injection bypasses validation.
- No usage logging → no cost visibility, no burn detection.
- Latency p99 > 60s without timeout → request hangs, user abandons.
- Prompt template changed without versioning → behavior drifts silently.

## Verification

- Run the feature end-to-end; confirm output, cost, latency logged.
- Inject a prompt injection attempt; confirm guardrail rejects.
- Inject a malformed tool input; confirm `zod` rejects.
- Trigger a provider 5xx; confirm fallback engages (or error is clear).
- Trigger a rate limit (429); confirm backoff and retry.
- Exceed context window; confirm trimming kicks in.
- Inspect Langfuse/Langsmith trace for the full call tree.
- Confirm cost cap triggers when the per-tenant budget is hit.
- Source references: https://platform.openai.com/docs/api-reference, https://docs.anthropic.com/claude/reference, https://sdk.vercel.ai/docs, https://js.langchain.com/, https://langfuse.com/, https://lang.smith/.
