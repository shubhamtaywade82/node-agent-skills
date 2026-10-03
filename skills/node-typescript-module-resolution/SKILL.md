---
name: node-typescript-module-resolution
description: Use when imports resolve differently in editor, compiler, tests, or production.
---

# TypeScript Module Resolution

## Purpose

aligning TypeScript resolution with Node.js package and runtime semantics.

## Activate when

- imports resolve differently in editor, compiler, tests, or production.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

the compiler's module and resolution mode must match the runtime/toolchain; package exports are respected

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Detect ESM/CJS.\n2. Inspect moduleResolution.\n3. Test package exports.\n4. Resolve extension behavior.\n5. Compile and execute representative imports.

## Failure modes

Avoid:

- using `paths` as runtime aliases without loader support; bundler resolution for a native Node runtime; hidden resolution differences between tests and production.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
