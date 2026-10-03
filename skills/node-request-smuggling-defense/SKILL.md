---
name: node-request-smuggling-defense
description: Use when the service sits behind multiple HTTP parsing layers or handles unusual transfer/header combinations.
---

# HTTP Request Smuggling Defense

## Purpose

reducing request desynchronization risk across Node.js servers, proxies, and parsers.

## Activate when

- the service sits behind multiple HTTP parsing layers or handles unusual transfer/header combinations.
- The change affects Node.js HTTP/network behavior or security at a protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, HTTP framework, proxy/load-balancer topology, and client libraries.
2. Locate request parsing, timeout, connection-pooling, signature, or redirect logic.
3. Inspect deployment manifests, ingress configuration, and relevant integration tests.
4. Confirm exact dependency versions before applying framework-specific mechanics.

## Decision rules

- Every HTTP parsing hop must agree on message framing; ambiguity is a reject condition.
- Conflicting or repeated Content-Length values must not be normalized casually.
- Transfer-Encoding handling must match the actual intermediary and origin protocol behavior.
- Parser errors must not leave a reusable connection in an uncertain message boundary state.
- Transfer-Encoding and Content-Length combinations must have an explicit accept/reject policy at every parsing hop.
## Implementation procedure

1. Inventory proxy/server/parser versions.
2. Avoid conflicting transfer-length handling.
3. Normalize/limit headers.
4. Reject ambiguous requests.
5. Test CL/TE variants through the real ingress path.

## Failure modes

Avoid:

- different proxy and app parsing rules; accepting duplicate content-length blindly; testing only direct localhost traffic.
- Trusting browser/network metadata that is client-controlled.
- Configuration that differs silently between ingress layers.

## Verification

1. Add a failing boundary/regression test first.
2. Exercise malformed, duplicated, slow, replayed, and cross-origin cases where applicable.
3. Run focused integration tests against the real HTTP stack.
4. Run the full suite and repository validation.
5. Verify proxy/deployment configuration and residual attack surface.
