---
name: node-package-self-reference
description: Use when source code imports its own package name rather than relative paths.
---

# Package Self-Reference

## Purpose

testing self-referential package imports for libraries and monorepos.

## Activate when

- source code imports its own package name rather than relative paths.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

self-reference must resolve through package exports and current package metadata; workspace links should mimic published behavior

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Configure package name/exports.\n2. Test self-import.\n3. Pack and install locally.\n4. Compile and run consumer fixtures.

## Failure modes

Avoid:

- source succeeds only because workspace symlinks bypass exports; self-reference unavailable in published tarball.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
