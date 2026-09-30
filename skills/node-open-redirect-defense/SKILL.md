---
name: node-open-redirect-defense
description: Use when login, logout, error, invitation, or callback routes redirect based on parameters.
---

# Open Redirect Defense

## Purpose

preventing untrusted input from redirecting users to attacker-controlled destinations.

## Activate when

- login, logout, error, invitation, or callback routes redirect based on parameters.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

- Prefer an explicit destination allowlist or same-origin comparison over string-prefix heuristics.
- Parse URLs structurally before comparing scheme, host, port, and path.
- Reject dangerous schemes such as javascript: and ambiguous protocol-relative targets outside the contract.
- Validate the exact normalized representation that will be passed to the redirect.
## Implementation procedure

1. Define allowed redirect classes.
2. Parse URL.
3. Accept safe relative paths or exact allowlist origins.
4. Reject credentials/javascript schemes.
5. Test encoded and protocol-relative URLs.

## Failure modes

Avoid:

- string-prefix checks; trusting `next` parameters; accepting `//evil.example` as relative.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
