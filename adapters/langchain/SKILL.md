---
name: langchain
description: Use when a Node.js backend uses LangChain.js or LangGraph.js for LLM chains, agents, RAG, or tool-calling patterns.
---

# LangChain.js Adapter

## Purpose

Translate the framework-neutral LLM-application contract onto LangChain.js, where chains, retrievers, tools, and graph nodes compose to produce LLM-driven behavior. Bound context, validate tool inputs, and stream tokens safely.

## Activate when

- Detect `langchain`, `@langchain/core`, `@langchain/community`, `@langchain/openai`, `@langchain/anthropic`, `@langchain/langgraph` in dependencies.

## Repository inspection

1. `package.json` — LangChain packages and versions. `@langchain/langgraph` for stateful agents.
2. Model client — `ChatOpenAI`, `ChatAnthropic`, `ChatGoogleGenerativeAI`. Read temperature, max_tokens, model name.
3. Prompt templates — `ChatPromptTemplate.fromMessages(...)`. Find the canonical prompt per chain.
4. Tools — `Tool` subclass or `zod`-defined tools. Confirm tool input validation.
5. Retrieval — `VectorStoreRetriever`, `@langchain/community/vectorstores/pg`. Confirm the vector store and embedding model.
6. Memory — `BufferMemory`, `ConversationSummaryMemory`. Confirm whether memory is per-session and bounded.
7. LangGraph — `StateGraph`, `END`, `START`. Find the graph nodes and edges.

## Decision rules

| Concern | Rule |
|---|---|
| Streaming | Use `stream()` for tokens; `streamEvents(version: "v2")` for nested events. Buffer client writes; flush on token boundary. |
| Tool input | Validate tool inputs with `zod` schemas. Never pass raw user input to a tool. |
| Context window | Bound message history before invoking. Trim > N tokens. Summarize or discard older turns. |
| Retrieval | Embed the query (not the prompt). Rerank results. Cite sources in the answer. Detect hallucination: ask the model to verify. |
| Concurrency | Bound parallel LLM calls. `p-limit` or `async-mutex`. One call per user request; do not fan out unboundedly. |
| Cost | Token usage is the cost. Log prompt + completion tokens per call. Cap per-request token usage. |
| Caching | Cache semantically equivalent prompts to skip the LLM. `@langchain/community/cache/ioredis`. |
| Streaming errors | Mid-stream failures must surface to client; do not silently truncate. |
| LangGraph | State is a typed object. Edges are conditional. `END` is a node, not a return. |
| Observability | `@langchain/langfuse` or `langsmith` for traces. OpenTelemetry for general spans. |

## Implementation procedure

1. Detect the LangChain packages and versions. Confirm `@langchain/langgraph` if stateful agents are needed.
2. Construct the model client with explicit temperature, max_tokens, and timeout. Pass `AbortSignal`.
3. Define tools with `zod` input schemas. Validate every tool input.
4. Build the chain or graph. Bound context (trim or summarize). Cap `maxSteps` (typically ≤ 5).
5. Stream the response to the client. Handle mid-stream errors.
6. Wire Langfuse or Langsmith tracing. Log usage per call.

## Failure modes

- Unbounded context window → token limit exceeded, call fails or truncates silently.
- Tool input without validation → prompt injection exploits the tool.
- Parallel LLM calls unbounded → rate limit exhausted, cost explosion.
- Memory per-session grows unbounded → OOM after long conversations.
- Hallucinated answer with no citation check → user acts on fabricated facts.
- Streamed response without error handling → mid-stream failure breaks the client.
- Cached prompt without semantic equivalence check → cache miss on every prompt.

## Verification

- Run a chain end-to-end; confirm tokens streamed and cost logged.
- Inject a bad tool input; confirm validation rejects.
- Exceed context window; confirm trimming kicks in.
- Test streaming failure mid-stream; confirm client receives the error.
- Run LangGraph with a cycle; confirm `recursion_limit` is hit.
- Inspect Langfuse/Langsmith trace for the full call tree.
- Source references: https://js.langchain.com/, https://langchain-ai.github.io/langgraphjs/, https://js.langchain.com/docs/modules/model_io/chat_model/, https://js.langchain.com/docs/modules/data_connection/.
