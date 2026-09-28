---
name: node-webhooks
description: Use when receiving provider webhooks, verifying signatures, preventing replay, deduplicating delivery, or deciding acknowledgement and retry behavior for external events.
---

# Webhooks

## Purpose
Process externally delivered events as untrusted, replayable messages whose authenticity and side effects must be independently controlled.

## Activate when
- Implementing Stripe/GitHub/payment/provider webhook receivers.
- Verifying signatures or raw request bodies.
- Handling provider retries, duplicate delivery, or event ordering.

## Repository inspection
Identify provider signing algorithm, raw-body access point, timestamp tolerance, event ID, durable dedupe state, transaction boundary, downstream side effects, and acknowledgement expectations.

## Decision rules
| Concern | Rule |
|---|---|
| Authenticity | Verify the provider signature over the exact bytes/defined canonical representation before business processing. |
| Replay | Validate timestamp/nonce/event freshness when the provider supports it. |
| Dedupe | Treat provider event IDs as replayable and enforce durable uniqueness. |
| Validation | Parse/validate the payload only after the authentication boundary is satisfied, while retaining raw data when required by verification. |
| Side effects | Make downstream effects idempotent; a 2xx acknowledgement must not imply every side effect completed synchronously. |
| Acknowledgement | Return success only according to the provider's retry contract; avoid expensive work when a fast acknowledgement is safe and a durable queue exists. |
| Ordering | Do not assume delivery order unless the provider contract guarantees it. |

## Implementation procedure
1. Preserve the raw request bytes needed for signature verification.
2. Verify signature and freshness before mutating application state.
3. Validate event envelope and payload into trusted internal types.
4. Atomically claim the event ID or otherwise deduplicate.
5. Apply side effects once or dispatch them to an idempotent queue.
6. Record processing outcome and provider metadata for replay/debugging.

## Failure modes
- JSON parsing or whitespace normalization changes the signed payload.
- Signature verification happens after side effects.
- Dedupe is in process memory.
- Provider retries cause duplicate charges/emails/provisioning.
- A slow endpoint times out and creates an uncontrolled retry storm.

## Verification
Test valid/invalid signatures, stale timestamps, duplicate delivery, concurrent duplicates, malformed payloads, downstream failure, and provider retry behavior.
