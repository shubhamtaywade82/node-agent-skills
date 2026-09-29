---
name: node-rest-api-design
description: Use when designing or changing REST endpoints, resource models, HTTP status semantics, error envelopes, representation shapes, or public API conventions.
---

# REST API Design

## Purpose
Use HTTP semantics deliberately while keeping resource contracts stable, predictable, and independent from internal domain structure.

## Activate when
- Creating CRUD or action-like endpoints.
- Reviewing endpoint naming, status codes, errors, or response envelopes.
- Exposing domain models through a public API.

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

## Implementation procedure
1. Define resources and invariants before route handlers.
2. Separate transport DTOs from domain entities.
3. Define success, validation, authorization, conflict, not-found, and infrastructure errors.
4. Add pagination/filtering semantics to collection endpoints.
5. Specify idempotency behavior for retried mutations.
6. Add contract tests for representative success and failure paths.

## Failure modes
- RPC verbs embedded in every URI without resource rationale.
- Database rows serialized directly.
- Error bodies vary per controller.
- 204/200/201 semantics are inconsistent across equivalent operations.
- Authorization is performed only once in middleware and assumed downstream.
- Collection endpoints return unbounded data.

## Verification
Test the HTTP contract at the boundary. Include invalid identifiers, missing resources, duplicate mutations, authorization failures, and infrastructure failures.
