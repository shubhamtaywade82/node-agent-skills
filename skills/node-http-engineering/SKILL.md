---
name: node-http-engineering
description: Use when designing or changing HTTP server request lifecycles, middleware, handlers, response semantics, transport errors, cancellation, or framework-independent HTTP infrastructure.
---

# HTTP Engineering

## Purpose
Keep HTTP transport mechanics separate from application semantics. Define one request lifecycle, one error contract, bounded resource use, and explicit ownership of middleware/context.

## Activate when
- Adding routes, middleware, interceptors, hooks, or HTTP adapters.
- Changing request parsing, response serialization, cancellation, or error handling.
- Diagnosing hanging requests, duplicate responses, leaked work, or inconsistent error payloads.

## Repository inspection
Identify runtime, HTTP server, framework, middleware registration order, error boundary, request-context mechanism, tests, and shutdown path. Trace one representative request end-to-end before editing.

## Decision rules
| Concern | Rule |
|---|---|
| Request input | Treat body, params, query, and headers as untrusted runtime data. |
| Error boundary | Convert domain/application failures to a stable transport error contract once. |
| Async work | Propagate cancellation/deadlines where downstream work supports it. |
| Middleware | Keep cross-cutting concerns narrow and ordered intentionally. |
| Response | Send exactly one terminal response; streaming paths need explicit ownership. |
| Context | Prefer explicit request context; use ambient context only when its lifecycle is proven. |
| Transport vs domain | HTTP status and headers belong at the transport boundary, not in domain services. |

## Implementation procedure
1. Define the HTTP contract first: inputs, success payload, errors, headers, and cancellation behavior.
2. Locate the owning transport boundary.
3. Parse and validate external data into typed internal input.
4. Invoke application code without leaking framework request/response objects inward.
5. Map known failures to safe public errors and unknown failures to generic 5xx responses.
6. Ensure request-scoped resources are released on success, failure, abort, and shutdown.
7. Add a focused HTTP test plus negative/abort coverage.

## Failure modes
- Middleware executes after the response has already been sent.
- Async work continues after client cancellation.
- Internal exception messages or stack traces leak to clients.
- Framework-specific request objects spread through domain modules.
- Validation is skipped because the TypeScript type looks correct.
- Multiple middleware layers each invent their own error envelope.

## Verification
- Test success, malformed input, domain failure, unexpected failure, aborted request, and streaming/large payload behavior where relevant.
- Confirm logs/traces correlate the request without exposing secrets.
- Confirm transport tests assert observable responses rather than middleware call order.
- Source references: https://developer.mozilla.org/en-US/docs/Web/HTTP ; framework adapters must follow their versioned official lifecycle documentation.
