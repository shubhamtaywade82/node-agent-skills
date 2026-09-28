---
name: node-external-integrations
description: integrations
---

# Node External Integrations

## Purpose
Use when implementing Node.js clients for third-party APIs, outbound webhooks, external callbacks, secrets, timeouts, retries, or dependency isolation.

## Activate when
Treat external services as unreliable dependencies with explicit contracts and failure policy.

## Repository inspection
- Third-party clients.
- Webhook consumers.
- Provider authentication or rate limits.

## Decision rules
Inspect HTTP client abstraction, timeouts, retry policy, secret management, signing, response validation, and telemetry.

## Implementation procedure
- Apply timeouts and cancellation to outbound calls.
- Validate provider responses at the boundary.
- Retry only safe transient failures.
- Keep provider DTOs isolated from domain models.
- Verify webhook signatures before processing.
- Make webhook handlers idempotent.

## Failure modes
1. Define the provider contract.
2. Implement a narrow adapter.
3. Set deadline, retry, and rate-limit behavior.
4. Validate and normalize responses.
5. Map provider failures to internal categories.
6. Add integration and redaction tests.

## Verification
- Infinite retries.
- No outbound timeout.
- Trusting HTTP success without validating data.
- Provider objects leaking into the domain.
- Unsigned webhook acceptance.

## Source foundation
Test success, timeout, connection failure, 429/5xx, malformed response, invalid signature, duplicate webhook, and secret redaction.
