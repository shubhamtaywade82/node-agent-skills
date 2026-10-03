---
name: node-request-signature-validation
description: Use when webhooks, internal callbacks, or partner APIs use request signatures.
---

# Request Signature Validation

## Purpose

validating signed requests using canonical bytes, algorithms, keys, and freshness.

## Activate when

- webhooks, internal callbacks, or partner APIs use request signatures.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

signature verification operates on exact signed bytes; algorithm/key identity is constrained; timing-safe comparison is used where appropriate

- Exact wire bytes and protocol semantics matter for cryptographic verification.
- Security controls must survive proxies, retries, and duplicate delivery.
- Timeouts and resource limits are end-to-end budgets, not isolated middleware settings.
- Prefer explicit allowlists over string heuristics.

## Implementation procedure

1. Identify signature scheme.
2. Preserve raw payload.
3. Canonicalize only per protocol.
4. Validate key/algorithm.
5. Verify freshness.
6. Compare safely.
7. Rotate keys.
8. Test tampering.

## Failure modes

Avoid:

- re-serializing JSON before verification; accepting arbitrary algorithms; comparing signatures naively.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
