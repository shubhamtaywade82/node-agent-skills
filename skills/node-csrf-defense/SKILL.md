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

CSRF protection is based on the authentication model; same-site policy is defense-in-depth; state-changing endpoints require appropriate origin/token controls

- Exact wire bytes and protocol semantics matter for cryptographic verification.
- Security controls must survive proxies, retries, and duplicate delivery.
- Timeouts and resource limits are end-to-end budgets, not isolated middleware settings.
- Prefer explicit allowlists over string heuristics.

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
