---
name: node-llm-streaming
description: Use when streaming LLM token completions to a client over HTTP/SSE/WebSocket from a Node.js backend, including error handling and cancellation.
---

# Node LLM Streaming

## Purpose

LLM completions are slow (1-10s+ for full response). Streaming tokens to the client makes perceived latency 10× lower and enables abort-on-disinterest. The contract is a stateful stream with explicit error and cancellation semantics.

## Activate when

- Streaming LLM tokens from a backend to a client (browser, mobile, downstream service).
- Choosing between SSE, WebSocket, and HTTP chunked for the streaming transport.
- Diagnosing dropped tokens, broken streams, or unbounded memory on the client.
- Implementing abort-on-disconnect (cancel the upstream LLM call when the client closes).

## Repository inspection

1. LLM SDK — grep for `ai`, `langchain`, `@anthropic-ai/sdk`, `openai`. Confirm `stream: true` or `streamText` is used.
2. Transport — grep for `text/event-stream`, `EventSource`, `WebSocket`, `Upgrade`. Confirm the streaming transport.
3. Response shape — grep for `toDataStreamResponse`, `toTextStreamResponse`, `transformStream`. Find the response format.
4. Abort — grep for `AbortSignal`, `AbortController`, `request.signal`. Confirm abort propagates to the LLM call.
5. Error handling — grep for `onError`, `catch`, `errorEvent`. Find how mid-stream errors surface to the client.
6. Backpressure — grep for `pipe`, `pipeline`, `drain`. Confirm the stream respects backpressure.
7. Heartbeat — grep for `heartbeat`, `ping`, `keep-alive`. Find the heartbeat for long-running streams.

## Decision rules

| Concern | Rule |
|---|---|
| Transport | SSE for one-way (LLM → client). WebSocket for two-way (client → LLM with tools, agent loops). HTTP chunked for raw byte streaming. |
| Format | AI SDK Data Stream Protocol (`toDataStreamResponse()`) for Vercel AI SDK. SSE `data: ...\n\n` for raw SSE. JSON lines for WebSocket. |
| Abort | Pass `AbortSignal` from the request to the LLM call. On client disconnect, the LLM call stops, cost stops accruing. |
| Error handling | Mid-stream failures surface as error events to the client. Do not silently truncate. The client must know the stream is broken. |
| Backpressure | Streaming pipelines must propagate pressure. Never buffer unboundedly in memory. |
| Heartbeat | For streams > 30s, send a heartbeat (comment `: ping\n\n` in SSE, JSON `{ type: "ping" }` in WebSocket) every 10s. |
| Token boundary | Buffer client writes; flush on token boundary (after each token or every 100ms). |
| Cleanup | On stream end (success, error, or abort), release all resources: LLM client, DB connections, queue acks. |
| Multi-modal | Text tokens via SSE. Image tokens via separate response (cannot stream binary inline in SSE; use base64 in WebSocket). |
| Observability | Log stream start, end, token count, latency, error. Trace the LLM call. |
| Idempotency | Streaming mutations (the LLM is generating a state change) need an idempotency key. If the client reconnects and the LLM call completes server-side, do not double-apply. |
| Reconnect | SSE supports `retry:` and `Last-Event-ID`. WebSocket reconnect is custom. Document the reconnection contract. |

## Implementation procedure

1. Confirm the LLM SDK supports streaming (`streamText`, `stream: true`).
2. Pick the transport: SSE for one-way, WebSocket for two-way, HTTP chunked for raw.
3. Implement the handler: parse + validate input, start the LLM stream, pipe to the client response.
4. Pass `AbortSignal` from the request to `streamText({ abortSignal })`. On client disconnect, the LLM call stops.
5. Implement mid-stream error handling: catch LLM errors, emit an error event to the client, end the stream.
6. Implement heartbeat for streams > 30s.
7. Implement cleanup in a `finally` block: release the LLM client, DB connections, queue acks.
8. Add observability: log stream start, end, token count, latency, error.

## Failure modes

- No `AbortSignal` propagation → client disconnects, LLM call continues, cost accrues.
- Mid-stream error silently swallowed → client thinks the stream is complete; missing tokens.
- No backpressure → server buffers unboundedly, OOM on long completions.
- No heartbeat → proxy/load balancer closes the connection after 30-60s of "inactivity" (no bytes flushed).
- Cleanup in `try` block only → exception in cleanup swallows the original error.
- Streaming binary inline in SSE → format breaks; use base64 in WebSocket.
- Token boundary not respected → client renders partial tokens (e.g., half a Unicode code point).
- No idempotency → reconnect after disconnect causes the LLM call to be retried, side effect applied twice.
- No reconnect contract → client cannot resume after a network blip.

## Verification

- Start a stream; confirm tokens arrive progressively.
- Disconnect mid-stream; confirm the LLM call stops and cost stops accruing.
- Inject a mid-stream error (kill the LLM client); confirm the client receives an error event.
- Send a stream > 30s; confirm the heartbeat keeps the connection alive.
- Trigger backpressure (slow client); confirm the server does not OOM.
- Trigger reconnect (close + reopen); confirm the stream resumes correctly (or the contract is documented).
- Inspect logs: stream start, end, token count, latency, error visible.
- Source references: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events, https://sdk.vercel.ai/docs/ai-sdk-core/stream-text, https://platform.openai.com/docs/api-reference/chat-streaming, https://docs.anthropic.com/claude/reference/messages-streaming, https://nodejs.org/api/stream.html.
