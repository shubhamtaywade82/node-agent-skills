---
name: node-typescript-config-engineering
description: Use when a TypeScript backend changes compiler configuration.
---

# TypeScript Configuration Engineering

## Purpose

designing tsconfig settings that preserve strictness, runtime compatibility, and predictable builds.

## Activate when

- a TypeScript backend changes compiler configuration.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

tsconfig is a build contract; compiler strictness, module mode, resolution, target, and declaration behavior are chosen deliberately

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Inspect extends chain.\n2. Detect module/resolution.\n3. Define strictness.\n4. Align target with runtime support.\n5. Separate build/test configs when needed.\n6. Run tsc on representative packages.

## Failure modes

Avoid:

- loosening strictness globally to fix one error; mixing bundler and Node resolution accidentally; target newer syntax than supported runtime.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
