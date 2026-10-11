---
name: node-api-engineering
description: Use when designing or changing HTTP REST APIs, OpenAPI contracts, pagination, idempotency, API versioning, or resource modeling in a Node.js backend.
---

# Node API Engineering

## Purpose

Design APIs as contracts: stable, documented, versioned, idempotent where mutations repeat, paginated where lists grow. The contract outlives the implementation.

## Activate when

- Adding or changing endpoints, methods, status codes, error envelopes, or response shapes.
- Designing pagination, filtering, sorting, or projection.
- Adding idempotency for retry-safe mutations.
- Versioning an API or planning a deprecation.
- Defining the OpenAPI/Swagger contract.
- Routing HTTP concerns (caching, conditional requests, content negotiation).

## Repository inspection

1. HTTP framework — grep for `express`, `fastify`, `@nestjs/core`, `hono`, `@hono/node-server`. Read the version.
2. Route definitions — find the router file(s). List every endpoint, method, and path.
3. OpenAPI contract — grep for `openapi.json`, `openapi.yaml`, `swagger.json`. Read the version (`3.0.x` vs `3.1.x`).
4. Error envelope — grep for `errorResponse`, `errorEnvelope`, `ApiError`. Find the canonical shape and confirm every handler uses it.
5. Pagination — grep for `cursor`, `offset`, `limit`, `page`, `per_page`. Confirm the same style across all list endpoints.
6. Idempotency — grep for `Idempotency-Key`, `idempotencyKey`. Confirm mutations that may retry are idempotent.
7. Versioning — grep for `/v1/`, `/v2/`, `Accept: application/vnd.api+json;version=`. Confirm the versioning strategy is consistent.
8. Content negotiation — grep for `Accept`, `Content-Type`, `res.format(`. Confirm the API serves JSON, JSON:API, or another negotiated format consistently.

## Decision rules

| Concern | Rule |
|---|---|
| Status codes | 200 success, 201 created, 204 no content, 400 malformed, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict, 422 semantic, 429 rate limited, 500 server, 503 unavailable. Never 200 for errors. |
| Error envelope | One canonical shape: `{ error: { code, message, details?, correlation_id } }`. Never leak stack traces. |
| Pagination | Cursor-based for large or growing lists (`?cursor=...&limit=50`). Offset only for small bounded lists. Always return `next_cursor` when more data exists. |
| Idempotency | Mutations that may retry (payment, email send, state transition) accept `Idempotency-Key` header. Server stores `(key, request_hash) → response` for ≥ 24h. |
| Versioning | Pick one: path (`/v1/`), header (`Accept: application/vnd.acme+json;version=1`), or content-type suffix. Document it. Never mix. |
| Filtering | Query params for equality (`?status=active`), `[]` for IN (`?status[]=active&status[]=pending`), operators for ranges (`?created_at[gte]=...`). |
| Sorting | `?sort=-created_at,name` (negative = desc). Document the default sort. |
| Projection | Avoid `?fields=` projection unless the resource is large; it complicates caching. |
| Resource modeling | Plural nouns (`/orders`), nested for sub-resources (`/orders/:id/items`), ≤ 1 level of nesting. |
| HTTP methods | GET is safe (no side effects), PUT is idempotent (full replace), POST creates, PATCH partial-updates, DELETE idempotent. Document for your API. |
| Conditional requests | Honor `If-None-Match`/`ETag` for GET; honor `If-Match`/`If-Modified-Since` for concurrency on PUT/PATCH. |
| Rate limits | Per-token or per-IP. Return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers. |
| Body limits | Set explicit `maxBodySize` per route. Reject 413 with a clear message. |

## Implementation procedure

1. Write the OpenAPI contract first: paths, methods, request/response schemas, error envelope.
2. Define the canonical error shape and the validation error → error envelope mapping.
3. Implement the handler: parse + validate input, call application code without leaking framework types, map failures to error envelope, return one terminal response.
4. Add pagination to every list endpoint. Document the cursor format.
5. Add idempotency to every mutating endpoint that may retry. Store idempotency keys in a table with a unique constraint.
6. Add a contract test that asserts every endpoint matches the OpenAPI definition (status codes, schemas, headers).
7. Run the contract test, the focused handler tests, and the full suite.

## Failure modes

- 200 OK with `{ success: false }` — lies to the client; breaks standard HTTP middleware.
- Different error envelope per endpoint — clients must special-case each one.
- Offset pagination on a growing list — page drift when items are inserted between requests.
- Missing idempotency on a payment endpoint — retry double-charges.
- Mixing `/v1/` and `Accept: version=1` — clients cannot predict which one wins.
- `?fields=` projection on a cached resource — cache key explosion.
- POST for idempotent updates — clients cannot retry safely.
- Validation errors return 500 instead of 400/422.
- No `X-RateLimit-*` headers — clients cannot throttle.
- Body size unbounded — DoS via 1GB JSON POST.

## Verification

- Run the OpenAPI contract test: every endpoint matches the spec (status codes, schemas, headers).
- Run focused handler tests: happy path, malformed input, semantic error, unauthenticated, unauthorized, rate-limited.
- Test pagination: request page 1, follow `next_cursor`, receive empty page at end.
- Test idempotency: same `Idempotency-Key` twice → same response, only one side effect.
- Test conditional: `If-None-Match` returns 304 when the resource is unchanged.
- Test rate limit: N+1 requests → 429 with `Retry-After`.
- Inspect the error envelope in every test — confirm one canonical shape.
- Source references: https://datatracker.ietf.org/doc/html/rfc9110, https://spec.openapis.org/oas/v3.1.0, https://datatracker.ietf.org/doc/html/rfc7234, https://stripe.com/docs/api/idempotent_requests, https://jsonapi.org/.
