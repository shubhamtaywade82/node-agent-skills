---
name: node-structured-cloning
description: Use when worker threads or message channels pass structured values.
---

# Structured Clone Boundaries

## Purpose

transferring complex data between workers or isolated execution contexts safely.

## Activate when

- worker threads or message channels pass structured values.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

transfer semantics, cloning cost, transferable ownership, and prototype behavior are explicit

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Define message schema.\n2. Minimize payload size.\n3. Transfer large buffers deliberately.\n4. Validate inbound messages.\n5. Benchmark cloning cost.

## Failure modes

Avoid:

- sending arbitrary object graphs; double ownership of transferables; assuming clone preserves class identity/prototypes.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
