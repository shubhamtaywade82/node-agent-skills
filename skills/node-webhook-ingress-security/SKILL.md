---
name: node-webhook-ingress-security
description: Use when providers send authenticated events to the backend.
---

# Webhook Ingress Security

## Purpose

securely receiving third-party webhooks at a Node.js HTTP boundary.

## Activate when

- providers send authenticated events to the backend.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

raw bytes are verified before parsing; source authentication, replay resistance, size limits, and idempotency are explicit

- Exact wire bytes and protocol semantics matter for cryptographic verification.
- Security controls must survive proxies, retries, and duplicate delivery.
- Timeouts and resource limits are end-to-end budgets, not isolated middleware settings.
- Prefer explicit allowlists over string heuristics.

## Implementation procedure

1. Capture raw body safely.
2. Verify provider signature.
3. Validate timestamp/nonce.
4. Enforce body limits.
5. Validate schema.
6. Deduplicate event IDs.
7. Enqueue durable processing.
8. Test tampering/replay.

## Failure modes

Avoid:

- parsing before signature verification; trusting event type; processing duplicates; accepting oversized bodies.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
