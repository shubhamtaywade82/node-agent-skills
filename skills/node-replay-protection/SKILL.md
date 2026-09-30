---
name: node-replay-protection
description: Use when signed requests, reset links, webhooks, or one-time actions can be replayed.
---

# Replay Protection

## Purpose

preventing valid requests or tokens from being reused beyond their intended window.

## Activate when

- signed requests, reset links, webhooks, or one-time actions can be replayed.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

- Enforce freshness and uniqueness at the authoritative processing boundary.
- Consume a nonce or event ID atomically so concurrent requests cannot both succeed.
- Replay state retention must cover the protocol window and expected delivery delay.
- Multi-instance deployments need shared or coordinated replay state unless ownership is provably single-instance.
## Implementation procedure

1. Define nonce/event ID.
2. Validate timestamp/window.
3. Record consumed identity atomically.
4. Bound storage.
5. Handle distributed concurrency.
6. Test duplicate delivery.

## Failure modes

Avoid:

- client-only timestamps; in-memory replay cache; accepting old signed messages indefinitely.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
