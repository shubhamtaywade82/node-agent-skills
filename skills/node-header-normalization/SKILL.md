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

- Header names are case-insensitive, but duplicate values can have protocol-specific meaning and must not be collapsed blindly.
- Hop-by-hop headers must not cross an end-to-end service boundary as application metadata.
- Cryptographic canonicalization must follow the signature protocol rather than generic normalization.
- Create one explicit normalized view for application consumers while preserving raw headers where protocol verification requires them.
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
