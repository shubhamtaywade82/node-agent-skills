---
name: node-csrf-defense
description: Use when cookie-based or browser credentials authorize state-changing HTTP requests.
---

# CSRF Defense

## Purpose

preventing cross-site request forgery against browser-authenticated backend sessions.

## Activate when

- cookie-based or browser credentials authorize state-changing HTTP requests.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

- SameSite cookies reduce CSRF risk but are not a complete server-side authorization proof.
- Validate Origin against a strict trusted-origin policy where it is part of the deployment contract.
- Cookie-authenticated state changes need an explicit anti-CSRF proof appropriate to the application.
- CORS controls browser read access; it is not a substitute for CSRF protection.
## Implementation procedure

1. Classify browser auth.
2. Set secure cookie attributes.
3. Validate Origin/Referer as appropriate.
4. Use CSRF token pattern when needed.
5. Test cross-origin state changes.

## Failure modes

Avoid:

- using CORS as CSRF protection; SameSite=None without need; missing protection on non-JSON forms.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
