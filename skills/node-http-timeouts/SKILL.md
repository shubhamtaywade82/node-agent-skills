---
name: node-http-timeouts
description: Use when network operations can hang or consume capacity under slow peers or partial failures.
---

# HTTP Timeout Engineering

## Purpose

setting bounded connection, header, body, and application deadlines for Node.js HTTP services.

## Activate when

- network operations can hang or consume capacity under slow peers or partial failures.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

- The end-to-end deadline is authoritative; every stage budget must fit inside it.
- AbortSignal propagation should stop cancellable downstream work when the request is cancelled.
- Timeouts are capacity controls, not merely error formatting.
- Retries must fit inside the remaining deadline and require an idempotency decision for mutations.
## Implementation procedure

1. Map client/server timeout stages.
2. Set connection/header/body/read/write deadlines.
3. Propagate AbortSignal.
4. Size budgets from SLOs.
5. Test slowloris and partial-send cases.

## Failure modes

Avoid:

- one global timeout for every stage; timeout without aborting underlying work; mismatched proxy/server/client budgets.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
