---
name: node-http-engineering
description: Use when designing or changing HTTP server request lifecycles, middleware, handlers, response semantics, transport errors, cancellation, or framework-independent HTTP infrastructure.
---

# Node HTTP Engineering

## Purpose

Keep HTTP transport mechanics separate from application semantics. Define one request lifecycle, one error contract, bounded resource use, and explicit ownership of middleware/context.

## Activate when

- Adding routes, middleware, interceptors, hooks, or HTTP adapters.
- Changing request parsing, response serialization, cancellation, or error handling.
- Diagnosing hanging requests, duplicate responses, leaked work, or inconsistent error payloads.
- Choosing between Express, Fastify, NestJS, Hono, or raw `node:http`.

## Repository inspection

1. HTTP server — grep for `express`, `fastify`, `@nestjs/core`, `hono`, `@hono/node-server`, `node:http`. Read the version.
2. Middleware — find the composition root, list middleware in registration order. Confirm error middleware is last.
3. Error boundary — grep for `errorHandler`, `(err, req, res, next)`, `app.setErrorHandler`. Find the canonical error shape.
4. Request context — grep for `AsyncLocalStorage`, `req.requestId`, `context`. Find how request-scoped state is propagated.
5. Body parsing — grep for `express.json()`, `fastify.bodyParser`, `rawBody`. Find the size limit and the raw-body path for webhook signature verification.
6. Graceful shutdown — grep for `server.close(`, `fastify.close()`. Find the shutdown sequence.
7. Tests — find HTTP integration tests using `supertest`, `fastify.inject`, or `@nestjs/testing`. Confirm they assert observable responses, not middleware call order.

## Decision rules

| Concern | Rule |
|---|---|
| Request input | Treat body, params, query, and headers as untrusted runtime data. Validate at the boundary. |
| Error boundary | Convert domain/application failures to a stable transport error contract once. Map known failures to safe public errors; unknown failures to generic 5xx. |
| Async work | Propagate cancellation/deadlines where downstream work supports it. Use `AbortSignal` from the request lifecycle. |
| Middleware | Keep cross-cutting concerns narrow and ordered intentionally. Logging first, then auth, then body parsing, then routing. |
| Response | Send exactly one terminal response. Streaming paths need explicit ownership of when the response ends. |
| Context | Prefer explicit request context (`AsyncLocalStorage`); use ambient context only when its lifecycle is proven. |
| Transport vs domain | HTTP status and headers belong at the transport boundary, not in domain services. Map at the edge. |
| Body limits | Set explicit `maxBodySize` per route. Reject 413 with a clear message. |
| Raw body | For webhook signature verification, preserve the raw body before JSON parsing. |
| Content negotiation | Honor `Accept` for response format (`Accept-Encoding` for compression). Default to JSON. |
| Conditional requests | Support `If-None-Match`/`ETag` for GET; `If-Match`/`If-Modified-Since` for concurrency on PUT/PATCH. |
| Compression | Negotiate gzip/brotli for ≥ 1KB responses. Skip for smaller. |
| Timeouts | Set request timeout (Fastify `connectionTimeout`, Express `server.setTimeout`). Default ≤ 30s. |
| Graceful shutdown | `server.close()` stops accepting new connections; drain in-flight; close pools; exit. |

## Implementation procedure

1. Define the HTTP contract first: inputs, success payload, errors, headers, and cancellation behavior.
2. Locate the owning transport boundary (the route + middleware stack for this resource).
3. Parse and validate external data into typed internal input. Use `unknown` + a schema, never `any`.
4. Invoke application code without leaking framework request/response objects inward. Pass typed DTOs.
5. Map known failures to safe public errors and unknown failures to generic 5xx. Never leak stack traces.
6. Ensure request-scoped resources are released on success, failure, abort, and shutdown.
7. Add a focused HTTP test plus negative/abort coverage. Assert observable responses, not middleware call order.

## Failure modes

- Middleware executes after the response has already been sent → headers already sent error.
- Async work continues after client cancellation → wasted resources, possible double-response.
- Internal exception messages or stack traces leak to clients → information disclosure.
- Framework-specific request objects spread through domain modules → domain is no longer portable.
- Validation is skipped because the TypeScript type looks correct → runtime crashes on malformed input.
- Multiple middleware layers each invent their own error envelope → clients cannot predict the shape.
- No request timeout → slow client hangs a worker indefinitely.
- Raw webhook body parsed as JSON before signature verification → signature mismatch.
- `req.pipe(res)` without an error handler on both → unhandled `error` event crashes the process.

## Verification

- Test success: valid request → expected response.
- Test malformed input: invalid JSON → 400 with the canonical error shape.
- Test domain failure: trigger a known error → expected status + error shape.
- Test unexpected failure: throw inside the handler → 500 with a generic error shape; no stack trace in the response.
- Test aborted request: client cancels mid-request → downstream work is cancelled; no leaked resources.
- Test streaming/large payload: send a 10MB body → 413 if over limit, success if under; confirm streaming path closes properly.
- Confirm logs/traces correlate the request without exposing secrets.
- Confirm transport tests assert observable responses rather than middleware call order.
- Source references: https://developer.mozilla.org/en-US/docs/Web/HTTP, https://nodejs.org/api/http.html, https://expressjs.com/en/guide/using-middleware/, https://fastify.dev/docs/latest/Reference/Lifecycle/, https://nodejs.org/api/globals.html#abortcontroller.
