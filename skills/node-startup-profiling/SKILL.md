---
name: node-startup-profiling
description: Use when serverless/container startup is too slow or startup work is excessive.
---

# Startup Profiling

## Purpose

measuring Node.js startup time and initialization cost before optimizing cold starts.

## Activate when

- serverless/container startup is too slow or startup work is excessive.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

startup profiling separates module loading, config, connection initialization, and application bootstrap

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Measure cold/warm start.\n2. Capture module timing.\n3. Identify heavy imports.\n4. Defer optional initialization.\n5. Benchmark after change.

## Failure modes

Avoid:

- micro-optimizing without a baseline; lazy-loading correctness-critical initialization; opening connections before configuration is validated.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
