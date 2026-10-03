---
name: node-package-exports
description: Use when a package defines public subpaths or ESM/CJS/browser/node conditions.
---

# Package Exports Engineering

## Purpose

designing package.json exports for stable public and conditional entrypoints.

## Activate when

- a package defines public subpaths or ESM/CJS/browser/node conditions.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

exports are an allowlist; internal files remain private; conditions are ordered and tested

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Define explicit exports map.\n2. Include types condition correctly.\n3. Test subpath imports.\n4. Test Node resolution.\n5. Remove accidental deep imports.

## Failure modes

Avoid:

- exporting `./*` broadly; types/runtime mismatch; consumers depending on unexported source paths.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
