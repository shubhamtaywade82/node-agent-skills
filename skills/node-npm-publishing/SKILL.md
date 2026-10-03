---
name: node-npm-publishing
description: Use when a package is released to npm or another npm-compatible registry.
---

# npm Publishing Engineering

## Purpose

publishing Node packages reproducibly and safely.

## Activate when

- a package is released to npm or another npm-compatible registry.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

published files are intentional; version/tag/access and lifecycle scripts are explicit; credentials are not embedded

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Inspect files/package.json.\n2. Run npm pack.\n3. Inspect tarball.\n4. Validate version/tag.\n5. Publish from clean CI.\n6. Verify installed artifact.

## Failure modes

Avoid:

- publishing local build leftovers; wrong tag; lifecycle scripts pulling mutable remote code.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
