---
name: node-package-provenance
description: Use when a package release needs supply-chain evidence.
---

# Package Provenance

## Purpose

establishing verifiable provenance for published Node packages.

## Activate when

- a package release needs supply-chain evidence.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

CI identity, source revision, workflow, and artifact are traceable; provenance is not treated as proof that code is harmless

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Configure trusted publishing/OIDC where supported.\n2. Enable provenance.\n3. Record source commit/workflow.\n4. Verify attestations.\n5. Restrict legacy tokens.

## Failure modes

Avoid:

- long-lived publish tokens; publishing from untrusted forks; assuming provenance replaces code review.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
