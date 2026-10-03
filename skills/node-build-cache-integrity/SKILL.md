---
name: node-build-cache-integrity
description: Use when CI or monorepos cache dependencies, bundles, generated files, or test outputs.
---

# Build Cache Integrity

## Purpose

using local/remote build caches without serving stale or cross-context artifacts.

## Activate when

- CI or monorepos cache dependencies, bundles, generated files, or test outputs.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

cache keys include all correctness inputs; untrusted branches cannot poison trusted release caches

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Define key dimensions.\n2. Include lockfile/compiler/platform inputs.\n3. Separate trust domains.\n4. Validate cache hit artifacts.\n5. Test cold/warm builds.

## Failure modes

Avoid:

- keying only on branch; shared writable cache between trust levels; stale codegen output.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
