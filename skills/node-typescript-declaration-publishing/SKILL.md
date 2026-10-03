---
name: node-typescript-declaration-publishing
description: Use when a Node package exposes TypeScript APIs to downstream consumers.
---

# TypeScript Declaration Publishing

## Purpose

publishing reliable .d.ts files for libraries or SDKs.

## Activate when

- a Node package exposes TypeScript APIs to downstream consumers.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

declarations describe the public surface, resolve through package exports, and are generated from authoritative source

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Configure declaration generation.\n2. Test published package types.\n3. Verify exports/types fields.\n4. Use API review for breaking changes.\n5. Test consumer compilation.

## Failure modes

Avoid:

- shipping declarations with missing imports; `types` pointing to source; declaration output not matching runtime exports.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
