---
name: node-rest-api-design
description: Use when designing or changing REST endpoints, resource models, HTTP status semantics, error envelopes, representation shapes, or public API conventions.
license: MIT
---

# REST API Design

## Purpose

Use HTTP semantics deliberately while keeping resource contracts stable, predictable, and independent from internal domain structure. The public API is a contract surface: URIs, statuses, and error shapes are read by clients (and code generators) as promises — churn there is churn in every consumer.

## Activate when

- Creating CRUD or action-like endpoints.
- Reviewing endpoint naming, status codes, errors, or response envelopes.
- Exposing domain models through a public API.

## Boundary with related skills

- Use `node-rest-api-design` for resource/status/error contract design.
- Use `node-api-engineering` / `node-http-engineering` for the transport-layer mechanics (headers, caching, conditional requests).
- Use `node-openapi` for publishing the machine-readable contract.
- Use `node-api-versioning` and `node-api-deprecation` for evolving this contract.
- Use `node-idempotency` for retried-mutation semantics.

## Repository inspection

Inspect existing URI conventions, pluralization, nesting depth, status codes, error shape, content negotiation, authentication, pagination, and contract tests. Reuse established conventions unless they are demonstrably unsafe or ambiguous.

## Decision rules

| Concern | Rule |
|---|---|
| URI | Model durable resources; avoid leaking implementation names. |
| POST | Use for creation or commands where a resource-oriented equivalent is not clearer. |
| PUT/PATCH | Match the chosen replacement/partial-update semantics consistently. |
| DELETE | Define whether deletion is immediate, asynchronous, or tombstoned. |
| Status codes | Choose from the actual outcome; do not return 200 for every result. |
| Errors | Stable machine-readable code + safe message + correlation identifier. |
| Representation | Do not expose database/ORM records directly as the public contract. |
| Nested resources | Nest only when the child lifecycle is genuinely scoped to the parent. |
| Actions | Use explicit commands when forcing an artificial REST resource would reduce clarity. |

Status selection from the outcome (not a style preference):

| Outcome | Status | Body |
|---|---|---|
| Created | 201 | representation + `Location` header |
| Synchronous read | 200 | representation |
| Accepted, work continues async | 202 | status/job link |
| Deleted immediately | 204 | none |
| Validation failed | 422 | error envelope, field errors |
| Auth missing vs insufficient | 401 vs 403 | error envelope |
| Missing/conflict/rate-limited | 404 / 409 / 429 | error envelope |
| Retried mutation | 2xx (idempotent replay) or 409 (conflict) | same shape |

## Implementation procedure

1. Define resources and invariants before route handlers.
2. Separate transport DTOs from domain entities.
3. Define success, validation, authorization, conflict, not-found, and infrastructure errors.
4. Add pagination/filtering semantics to collection endpoints.
5. Specify idempotency behavior for retried mutations.
6. Add contract tests for representative success and failure paths.

**Reference example** — a resource endpoint with stable error envelope, DTO separation, and pagination:

```ts
// routes/orders.ts — resource semantics, transport DTO, one error model

// The public representation is a DTO: the ORM row never crosses the boundary
const OrderDto = z.object({
  id: z.string(),
  status: z.enum(["open", "paid", "shipped"]),
  totalCents: z.number().int(),
  placedAt: z.string().datetime(),
}).openapi("Order");

const CreateOrderDto = z.object({
  customerRef: z.string().min(1).max(64),
  items: z.array(z.object({ sku: z.string(), qty: z.number().int().positive() })).min(1),
});

app.post("/orders", { schema: { body: CreateOrderDto, response: { 201: OrderDto, 422: ErrorEnvelope } } },
  async (request, reply) => {
    const { orderId } = await orders.create(request.body, request.session);
    const order = await orders.get(orderId, request.session);      // authorize EVERY access
    reply.code(201).header("Location", `/orders/${order.id}`).send(toDto(order));
  });

// GET /orders/:id — 200 / 404 / 401|403, one status per outcome
app.get("/orders/:id", { schema: { response: { 200: OrderDto, 404: ErrorEnvelope } } },
  async (request, reply) => {
    const order = await orders.find(request.params.id, request.session);
    if (!order) throw new NotFoundError("order", request.params.id);
    return toDto(order);
  });

// Collection: bounded, paginated, stable page tokens
app.get("/orders", { schema: { querystring: PageQuery } }, async (request) => {
  const { items, nextCursor } = await orders.list(request.session, request.query);
  return { items: items.map(toDto), nextCursor };   // cursor, not offset: stable under inserts
});
```

```ts
// The ONE error envelope for the whole API — field errors keyed by stable names
interface ErrorEnvelope {
  error: {
    code: string;                    // stable, machine-readable: "order.not_found"
    message: string;                 // safe for display; never internal detail
    fieldErrors?: Record<string, string[]>;   // 422 mapping
    requestId: string;               // correlation: also logged, also echoed in headers
  };
}
```

Action endpoints — explicit command when a resource would be artificial:

```
POST /orders/:id/cancellation        # command: request cancellation (202 + status link)
POST /payments/:id/capture           # command: capture an authorized payment
# not: PATCH /orders/:id { "status": "cancelling" } — lifecycle encoded as data mutation
```

## Failure modes

- RPC verbs embedded in every URI without resource rationale (`/getUser`, `/createOrder`, `/doPayment`).
- Database rows serialized directly — internal columns (`tenant_id`, soft-delete metadata, FK ids) leak into the public contract; renames become breaking changes.
- Error bodies vary per controller — three shapes for the same failure class; clients special-case each.
- 204/200/201 semantics inconsistent across equivalent operations (create returns 200 here, 201 there).
- Authorization performed only once in middleware and assumed downstream — object-level checks missing; tenant A reads tenant B's order by ID.
- Collection endpoints return unbounded data — no pagination default; one customer's 400k orders takes the API down.
- `PATCH` accepting full replacement on one endpoint and merge semantics on another.
- `Location` header missing on 201s — clients re-POST to discover the created resource.

## Verification

Test the HTTP contract at the boundary. Include invalid identifiers, missing resources, duplicate mutations, authorization failures, and infrastructure failures. Concretely: (a) contract test per representative path asserting status + envelope schema + `Location` on 201; (b) cross-tenant ID → 404 (not 403 — do not leak existence); (c) replayed POST with idempotency key → same result, single side effect; (d) collection contract asserts bounded page size and monotone cursor pagination; (e) OpenAPI contract test (if `node-openapi` discipline applies) proves documented statuses match actual responses.
