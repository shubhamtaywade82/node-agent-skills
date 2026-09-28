---
name: node-api-engineering
description: api
---

# Node Api Engineering

## Purpose
Use when designing or changing Node.js HTTP APIs, REST resources, OpenAPI contracts, pagination, idempotency, or API versioning.

## Activate when
Treat HTTP contracts as compatibility boundaries between independent clients and services.

## Repository inspection
- Adding or changing endpoints.
- Changing request/response shapes.
- Pagination or idempotency.

## Decision rules
Inspect routing, middleware, validation, serializers, authentication, schema files, error envelopes, and compatibility policy.

## Implementation procedure
- Define request, response, status, and error contracts before handler code.
- Validate path, query, headers, and body separately.
- Make pagination deterministic.
- Use durable idempotency for retryable side effects.
- Treat versioning as an explicit compatibility policy.

## Failure modes
1. Define the contract.
2. Map auth and tenant boundaries.
3. Validate transport input.
4. Invoke application logic through explicit interfaces.
5. Serialize only the public shape.
6. Add negative and compatibility tests.

## Verification
- Persistence models leak to clients.
- Ambiguous error status.
- Unstable pagination.
- Idempotency without durable deduplication.

## Source foundation
Run schema validation, API integration tests, negative cases, and backwards-compatibility checks.
