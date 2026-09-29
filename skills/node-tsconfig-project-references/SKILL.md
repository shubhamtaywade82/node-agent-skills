---
name: node-tsconfig-project-references
description: Use when a monorepo or large backend has multiple TypeScript packages.
---

# TypeScript Project References

## Purpose

splitting large TypeScript repositories into incremental, dependency-aware projects.

## Activate when

- a monorepo or large backend has multiple TypeScript packages.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

references form a directed graph; composite outputs are explicit; dependency boundaries remain testable

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Map packages.\n2. Enable composite where appropriate.\n3. Define references.\n4. Isolate build outputs.\n5. Run build graph.\n6. Test incremental rebuilds.

## Failure modes

Avoid:

- cyclic references; generated declarations from stale builds; sharing source paths that bypass package boundaries.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
