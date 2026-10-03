---
name: node-lockfile-integrity
description: Use when dependencies change or CI installs from a lockfile.
---

# Lockfile Integrity

## Purpose

keeping dependency lockfiles reproducible, reviewable, and aligned with package manifests.

## Activate when

- dependencies change or CI installs from a lockfile.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

the lockfile is a supply-chain artifact; CI must fail on unexpected drift; package manager and lockfile versions are aligned

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Inspect packageManager/lockfile.\n2. Use immutable/frozen install.\n3. Review lockfile diff.\n4. Detect registry/source changes.\n5. Test clean install.

## Failure modes

Avoid:

- regenerating lockfiles with a different package manager; accepting registry/source changes blindly; ignoring lockfile churn.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
