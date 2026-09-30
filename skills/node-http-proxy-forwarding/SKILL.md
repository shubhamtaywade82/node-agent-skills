---
name: node-http-proxy-forwarding
description: Use when a service runs behind load balancers/proxies or makes proxied outbound HTTP requests.
---

# HTTP Proxy and Forwarding

## Purpose

handling proxies, forwarded headers, and client identity safely in Node.js services.

## Activate when

- a service runs behind load balancers/proxies or makes proxied outbound HTTP requests.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- Trust forwarded identity data only from explicitly trusted proxy hops.
- Client-supplied X-Forwarded-* values must be ignored or overwritten outside that trust boundary.
- Reconstructed scheme and host must not silently drive security decisions unless their provenance is trusted.
- Outbound proxy routing must be explicit and must not create loops or accidental bypasses.
## Implementation procedure

1. Map proxy topology.
2. Define trusted proxy boundaries.
3. Parse Forwarded/X-Forwarded-* safely.
4. Configure outbound proxy rules.
5. Test direct/proxied requests.

## Failure modes

Avoid:

- trusting client-supplied X-Forwarded-For; reconstructing absolute URLs from untrusted headers; proxy loops.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
