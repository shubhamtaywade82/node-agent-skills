---
name: node-http-keepalive
description: Use when services use high-volume outbound HTTP or long-lived inbound connections.
---

# HTTP Keep-Alive Engineering

## Purpose

tuning persistent HTTP connections without exhausting sockets or causing stale connection failures.

## Activate when

- services use high-volume outbound HTTP or long-lived inbound connections.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

keep-alive is a capacity and latency trade-off; pool limits and idle expiry are explicit; connection reuse does not bypass request deadlines

- Exact wire bytes and protocol semantics matter for cryptographic verification.
- Security controls must survive proxies, retries, and duplicate delivery.
- Timeouts and resource limits are end-to-end budgets, not isolated middleware settings.
- Prefer explicit allowlists over string heuristics.

## Implementation procedure

1. Inspect client/agent pooling.
2. Size max connections.
3. Set keep-alive/idle policies.
4. Handle socket reuse errors.
5. Observe active/idle sockets.
6. Test bursts and server close.

## Failure modes

Avoid:

- unbounded sockets; disabling keep-alive without evidence; stale pooled connections causing retries.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
