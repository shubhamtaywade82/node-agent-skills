---
name: node-tls-certificate-management
description: Use when services terminate TLS or make TLS-protected outbound connections.
---

# TLS and Certificate Management

## Purpose

operating TLS trust, certificate rotation, and secure connections in Node.js.

## Activate when

- services terminate TLS or make TLS-protected outbound connections.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- Certificate validation must bind the peer identity to the intended hostname and trusted chain.
- SNI and ALPN are protocol choices that must match the deployed topology.
- Private keys require narrow access and must never appear in logs, source, or test fixtures.
- Certificate rotation requires overlap, expiry monitoring, and a proven reload path.
- Validate the full certificate chain and hostname; SNI is part of peer identity selection.
## Implementation procedure

1. Identify TLS termination.
2. Configure trust store.
3. Validate hostname/SAN.
4. Monitor expiry.
5. Rotate with overlap.
6. Test invalid/expired certs.
7. Avoid disabling verification.

## Failure modes

Avoid:

- rejectUnauthorized false in production; pinning without rotation plan; certificates embedded in source.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
