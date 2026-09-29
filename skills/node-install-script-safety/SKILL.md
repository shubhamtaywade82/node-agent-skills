---
name: node-install-script-safety
description: Use when npm/pnpm/yarn install runs third-party lifecycle scripts.
---

# Install Script Safety

## Purpose

evaluating dependency install lifecycle scripts as executable supply-chain code.

## Activate when

- npm/pnpm/yarn install runs third-party lifecycle scripts.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

install scripts are trusted executable code; repository policy determines whether they are allowed and where they run

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Inventory lifecycle scripts.\n2. Inspect package manager script policy.\n3. Isolate CI permissions.\n4. Use frozen lockfile.\n5. Review unexpected script changes.\n6. Test clean install.

## Failure modes

Avoid:

- disabling scripts globally without understanding native dependencies; running installs with production secrets; trusting transitive scripts automatically.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
