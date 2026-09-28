---
name: node-external-integrations
description: Use when implementing Node.js clients for third-party APIs, outbound webhooks, external callbacks, secrets, timeouts, retries, or dependency isolation.
---

# Node External Integrations

## Purpose
Treat external services as unreliable dependencies with explicit contracts and failure policy.

## Activate when
Add third-party clients, webhook consumers, provider authentication, rate limits, or retries.

## Repository inspection
Inspect HTTP client abstraction, timeout policy, retry policy, secret management, signing, response validation, and telemetry.

## Decision rules
Apply timeouts and cancellation. Validate provider responses. Retry only safe transient failures. Isolate provider DTOs from domain models. Verify webhook signatures. Make webhook processing idempotent.

## Implementation procedure
1. Define provider contract. 2. Implement narrow adapter. 3. Set timeout/retry/rate-limit policy. 4. Validate/normalize responses. 5. Map provider errors. 6. Add integration/redaction tests.

## Failure modes
Infinite retries; no outbound timeout; trusting HTTP success without payload validation; provider objects leaking into domain; unsigned webhooks.

## Verification
Test success, timeout, connection failure, 429/5xx, malformed response, invalid signature, duplicate webhook, and secret redaction.

## Source foundation
https://nodejs.org/api/globals.html#class-abortcontroller
