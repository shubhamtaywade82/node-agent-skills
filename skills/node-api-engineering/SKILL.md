---
name: node-api-engineering
description: Use when designing or changing Node.js HTTP APIs, REST resources, OpenAPI contracts, pagination, idempotency, or API versioning.
---

# Node Api Engineering

## Purpose
Treat HTTP contracts as compatibility boundaries between independent clients and services.

## Activate when
Add/change endpoints, request/response shapes, pagination, idempotency, or versioning.

## Repository inspection
Inspect routing, middleware, validation, serializers, authentication, schema files, error envelopes, and compatibility policy.

## Decision rules
Define request, response, status, and error contracts before handler code. Validate transport parts separately. Make pagination deterministic. Use durable idempotency for retryable side effects. Version explicitly.

## Implementation procedure
1. Define contract. 2. Map auth/tenant boundary. 3. Validate transport input. 4. Invoke application interfaces. 5. Serialize public shape. 6. Add negative/compatibility tests.

## Failure modes
Persistence models leak to clients; ambiguous statuses; unstable pagination; idempotency without durable deduplication.

## Verification
Run schema validation, API integration tests, negative cases, and backwards-compatibility checks.

## Source foundation
https://spec.openapis.org/oas/latest.html
