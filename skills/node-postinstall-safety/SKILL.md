---
name: node-postinstall-safety
description: Use when dependencies execute postinstall hooks.
---

# Postinstall Safety

## Purpose

preventing postinstall scripts from becoming an uncontrolled production build or download channel.

## Activate when

- dependencies execute postinstall hooks.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

postinstall actions are deterministic, expected, and do not fetch arbitrary executable content at install time

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Inspect package scripts.\n2. Identify native binary downloads/builds.\n3. Pin versions/check integrity.\n4. Restrict network/credentials during install.\n5. Verify artifact.

## Failure modes

Avoid:

- remote code download during install; secrets available to lifecycle scripts; accepting prebuilt binaries without provenance.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
