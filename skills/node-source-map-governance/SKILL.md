---
name: node-source-map-governance
description: Use when production JavaScript bundles emit source maps.
---

# Source Map Governance

## Purpose

shipping useful source maps without leaking source code, paths, or secrets.

## Activate when

- production JavaScript bundles emit source maps.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

source-map exposure is an explicit product decision; paths and embedded sources are controlled; error tooling access is restricted

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Choose hidden/public/source-content policy.\n2. Normalize paths.\n3. Review map contents.\n4. Test stack trace mapping.\n5. Restrict hosted maps.

## Failure modes

Avoid:

- publishing private source via browser-visible maps; embedding secrets; unstable absolute paths in maps.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
