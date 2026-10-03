---
name: node-esm-cjs-interoperability
description: Use when a backend consumes mixed-module dependencies or exposes multiple formats.
---

# ESM and CJS Interoperability

## Purpose

bridging CommonJS and ESM packages without runtime import surprises.

## Activate when

- a backend consumes mixed-module dependencies or exposes multiple formats.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

interop is governed by actual package exports/runtime behavior; default/named import assumptions are tested

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Inspect package type/exports.\n2. Test import/require paths.\n3. Use dynamic import where required.\n4. Document interop boundary.\n5. Test built output.

## Failure modes

Avoid:

- assuming transpilation equals Node interop; synthetic default assumptions; dual entrypoints with inconsistent behavior.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
