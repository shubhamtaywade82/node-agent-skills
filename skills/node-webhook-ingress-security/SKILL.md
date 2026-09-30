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

- Preserve and authenticate the raw payload before parsing when the provider signs exact bytes.
- Signature validation, replay protection, schema validation, and idempotent processing are separate controls.
- A successful HTTP acknowledgment should follow a durable acceptance decision.
- Enforce payload and processing bounds before expensive downstream work.
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
