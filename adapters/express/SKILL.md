---
name: express
description: Use when a Node.js backend uses Express 5.x and the HTTP design must map correctly to its middleware, routing, async error, and server lifecycle semantics.
---

# Express 5 Adapter

## Purpose
Translate the framework-neutral HTTP contract into Express 5.x without leaking Express concerns into application layers.

## Activate when
Detect express in package.json or imports and verify the installed major is 5.x.

## Repository inspection
Find app/router composition, middleware order, error handler, raw-body handling, listen/startup path, and HTTP tests.

## Decision rules
- Express middleware runs in registration order; a middleware that neither ends the response nor calls next() can leave requests hanging.
- Express 5 forwards rejected promises from handlers/middleware to the error handler.
- Error middleware must use (err, req, res, next) and be registered after normal middleware/routes.
- When headers are already sent, delegate to the default error handler rather than attempting another response.
- Express 5 changed path-pattern and request parsing behaviors; follow the v5 migration guide rather than v4 examples.
- Keep Request/Response objects at the adapter boundary.

## Implementation procedure
1. Build framework setup in the composition root.
2. Register parsing, security, and observability middleware in explicit order.
3. Route to application handlers with transport DTOs.
4. Register one normalized error boundary last.
5. Close server and dependencies through the production runtime lifecycle.

## Failure modes
- v4 routing syntax copied into Express 5.
- Async rejection handled twice.
- Error middleware installed before routes.
- Raw webhook body lost before signature verification.
- req/res types leak through domain code.

## Verification
Test middleware ordering, async rejection, malformed requests, error serialization, already-sent responses, startup failure, and graceful shutdown.

## Sources
- https://expressjs.com/en/guide/using-middleware/
- https://expressjs.com/en/guide/error-handling/
- https://expressjs.com/en/guide/migrating-5/