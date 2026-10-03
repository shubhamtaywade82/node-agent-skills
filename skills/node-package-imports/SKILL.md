---
name: node-package-imports
description: Use when a package uses `#internal/*` or similar internal aliases.
---

# Package Imports Engineering

## Purpose

using package.json imports aliases without creating runtime/compiler divergence.

## Activate when

- a package uses `#internal/*` or similar internal aliases.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

imports are private to the package; mapping is supported by the actual runtime/toolchain; tests use the same resolution semantics

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Define internal aliases.\n2. Align TypeScript resolution.\n3. Verify Node execution.\n4. Test development and built output.\n5. Keep aliases internal.

## Failure modes

Avoid:

- TypeScript-only aliases; exposing `#` paths publicly; aliases pointing outside the package contract.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
