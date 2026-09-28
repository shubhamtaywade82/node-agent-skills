---
name: node-graphql
description: Use when designing or changing GraphQL schemas, resolvers, authorization, query complexity, batching, pagination, or subscriptions in Node.js services.
---

# GraphQL

## Purpose
Treat the GraphQL schema as a public contract while keeping resolver execution bounded, authorized, and observable.

## Activate when
- Adding queries, mutations, fields, fragments, or subscriptions.
- Introducing DataLoader/batching or changing resolver data access.
- Debugging N+1 queries, expensive queries, authorization gaps, or unbounded nested selection.

## Repository inspection
Inspect schema location, code generation, resolver composition, context/auth model, data loaders, query depth/complexity controls, persisted-operation strategy, and transport endpoint.

## Decision rules
| Concern | Rule |
|---|---|
| Schema | Model client capabilities, not ORM tables. |
| Authorization | Enforce permissions where the protected data is resolved; authentication alone is not authorization. |
| Batching | Batch repeated data access without changing authorization semantics. |
| Cost | Bound depth, complexity, pagination, field fan-out, and response size as required by the threat model. |
| Errors | Avoid leaking internal failures; preserve stable client-visible error codes/metadata. |
| Mutations | Define idempotency/retry behavior for externally triggered side effects. |
| Subscriptions | Bound connection count, event fan-out, and per-client buffers. |

## Implementation procedure
1. Design the schema and compatibility impact.
2. Resolve input into validated internal values.
3. Establish request identity/tenant context.
4. Authorize access for each protected operation/data boundary.
5. Batch or cache only after proving the authorization and consistency semantics.
6. Add query-cost and resource bounds before exposing expensive nested paths.
7. Test field-level authorization and pathological selections.

## Failure modes
- A resolver assumes a parent object was already authorized.
- DataLoader caches data across tenants or security contexts.
- Nested queries create multiplicative database load.
- GraphQL errors expose provider/database details.
- Subscription clients accumulate unbounded outbound buffers.

## Verification
Use schema validation, resolver unit tests, authorization integration tests, pathological-query tests, and subscription lifecycle tests.
Sources: https://graphql.org/learn/ ; https://graphql.github.io/graphql-over-http/
