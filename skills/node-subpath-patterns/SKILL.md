---
name: node-subpath-patterns
description: Use when multiple related files are exported with patterns.
---

# Package Subpath Patterns

## Purpose

using wildcard package exports/imports without accidental API expansion.

## Activate when

- multiple related files are exported with patterns.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

patterns are narrow and deterministic; generated names cannot expose private artifacts

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Define constrained patterns.\n2. Inspect generated output.\n3. Test allowed/forbidden paths.\n4. Review package tarball.

## Failure modes

Avoid:

- wildcard exporting tests/config/secrets; pattern overlapping private paths.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
