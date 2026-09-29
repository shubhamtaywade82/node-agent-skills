---
name: hono
description: Use when a Node.js backend uses Hono 4.x and HTTP design must map correctly to its Request/Response, middleware, Context, error, and runtime portability semantics.
---

# Hono 4 Adapter

## Purpose
Translate framework-neutral HTTP design into Hono 4.x while preserving Web-standard Request/Response behavior and explicit context lifecycle.

## Activate when
Detect the hono package and verify the installed major is 4.x; also identify the target runtime such as Node, Bun, Deno, or an edge runtime because APIs and resource constraints differ.

## Repository inspection
Inspect route composition, middleware order, Context variables, onError/notFound handling, runtime bindings, context storage, and tests.

## Decision rules
- Handlers return Response values; middleware should await next() before applying after-response behavior.
- A middleware can short-circuit by returning a Response; use this deliberately for authentication and policy gates.
- Use onError for the application's public error boundary and keep internal errors redacted.
- Context variables are request-scoped; TypeScript declarations do not prove the middleware that populates a variable actually ran.
- Avoid Node-only APIs in code intended to run on non-Node Hono runtimes.
- Keep runtime bindings and Context at the adapter edge.

## Implementation procedure
1. Define transport contracts using Web-standard request/response semantics.
2. Register middleware with explicit route scope.
3. Validate external input and attach trusted values to a typed context boundary.
4. Map application failures in onError.
5. Test the same logic against the actual deployment runtime when portability matters.

## Failure modes
- TypeScript says a context variable exists even when its middleware was bypassed.
- Middleware forgets await next() and loses downstream behavior.
- Node-specific code breaks on an edge runtime.
- onError exposes provider/database details.
- Context storage is assumed available without checking runtime support.

## Verification
Test middleware short-circuiting, Context variable initialization, validation failures, error mapping, and runtime-specific behavior.

## Sources
- https://hono.dev/docs/guides/middleware
- https://hono.dev/docs/api/context
- https://hono.dev/docs/middleware/builtin/context-storage