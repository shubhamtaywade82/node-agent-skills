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

freshness and uniqueness are explicit; replay state is stored at the authoritative boundary with a bounded retention period

- Exact wire bytes and protocol semantics matter for cryptographic verification.
- Security controls must survive proxies, retries, and duplicate delivery.
- Timeouts and resource limits are end-to-end budgets, not isolated middleware settings.
- Prefer explicit allowlists over string heuristics.

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
