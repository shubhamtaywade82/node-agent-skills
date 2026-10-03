---
name: node-http2-engineering
description: Use when the backend uses `node:http2` or terminates HTTP/2.
---

# HTTP/2 Engineering

## Purpose

operating HTTP/2 safely with Node.js services and clients.

## Activate when

- the backend uses `node:http2` or terminates HTTP/2.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

stream concurrency, flow control, header compression, TLS, and graceful shutdown are explicit; HTTP/1 fallback behavior is tested

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Identify protocol topology.\n2. Configure ALPN/TLS.\n3. Bound concurrent streams.\n4. Monitor sessions.\n5. Propagate cancellation.\n6. Test reset/drain behavior.

## Failure modes

Avoid:

- assuming HTTP/2 behaves like HTTP/1; unbounded stream concurrency; unsafe cleartext HTTP/2 exposure.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
