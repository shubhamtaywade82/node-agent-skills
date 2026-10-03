---
name: node-dependency-confusion-defense
description: Use when a project consumes internal packages, scoped or unscoped.
---

# Dependency Confusion Defense

## Purpose

preventing private package names from resolving to public attacker-controlled packages.

## Activate when

- a project consumes internal packages, scoped or unscoped.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

registry scopes and source policy are explicit; private names cannot silently fall back to public registries

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Inventory registry config.\n2. Scope internal packages.\n3. Configure provenance/registry policy.\n4. Inspect lockfile sources.\n5. Test clean install.

## Failure modes

Avoid:

- mixed registry fallback; unscoped private package names; user-specific npm configuration masking repository intent.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
