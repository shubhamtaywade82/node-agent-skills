---
name: node-package-manager-policy
description: Use when teams use npm, pnpm, yarn, or multiple package managers.
---

# Package Manager Policy

## Purpose

standardizing package-manager selection and invocation across Node repositories.

## Activate when

- teams use npm, pnpm, yarn, or multiple package managers.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

one authoritative package manager/version is declared; scripts and CI use the same tool; Corepack/version management is explicit

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Inspect packageManager and lockfile.\n2. Define supported commands.\n3. Align CI.\n4. Prevent mixed lockfiles.\n5. Test clean install.

## Failure modes

Avoid:

- committing multiple lockfiles; global package manager drift; CI using a different tool than developers.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
