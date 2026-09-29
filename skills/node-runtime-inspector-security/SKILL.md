---
name: node-runtime-inspector-security
description: Use when diagnostics use inspector, debugger ports, or remote debugging.
---

# Runtime Inspector Security

## Purpose

using Node inspector/debug interfaces without exposing arbitrary code execution.

## Activate when

- diagnostics use inspector, debugger ports, or remote debugging.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

inspector is privileged control; bind only to protected interfaces; authentication and network isolation are explicit

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Inventory inspector usage.\n2. Disable by default.\n3. Bind loopback/protected network.\n4. Firewall access.\n5. Restrict production exposure.\n6. Test reachability.

## Failure modes

Avoid:

- binding inspector to 0.0.0.0; exposing unauthenticated debugger ports; assuming private VPC equals authentication.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
