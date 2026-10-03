---
name: node-header-normalization
description: Use when security, routing, caching, signatures, or downstream behavior depends on headers.
---

# HTTP Header Normalization

## Purpose

handling HTTP headers consistently and safely across Node.js/proxy boundaries.

## Activate when

- security, routing, caching, signatures, or downstream behavior depends on headers.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

headers are case-insensitive but duplicate/conflicting semantics are explicit; security-sensitive headers have a single authoritative source

- Exact wire bytes and protocol semantics matter for cryptographic verification.
- Security controls must survive proxies, retries, and duplicate delivery.
- Timeouts and resource limits are end-to-end budgets, not isolated middleware settings.
- Prefer explicit allowlists over string heuristics.

## Implementation procedure

1. Identify security-critical headers.
2. Normalize representation.
3. Reject conflicting duplicates where required.
4. Trust forwarded headers only from known hops.
5. Test whitespace/duplicate cases.

## Failure modes

Avoid:

- joining duplicate security headers blindly; trusting user-supplied host/proxy headers; changing signed header bytes.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
