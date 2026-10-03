---
name: node-dual-package-hazards
description: Use when a package has dual module entrypoints.
---

# Dual Package Hazard Management

## Purpose

publishing or consuming packages available as both ESM and CommonJS.

## Activate when

- a package has dual module entrypoints.
- The change affects the TypeScript compiler, Node.js module graph, package boundary, or release path.

## Repository inspection

1. Detect Node.js/TypeScript version, module type, package manager, workspace layout, and build/test commands.
2. Inspect package.json exports/imports/types fields and tsconfig inheritance.
3. Identify the actual runtime entrypoints and published artifact shape.
4. Confirm exact tool versions before applying version-specific behavior.

## Decision rules

the two module graphs must not create duplicate state or semantic differences; conditional exports are explicit

- Runtime module semantics are authoritative over editor assumptions.
- Package metadata is part of the public API.
- Published artifacts must be tested as installed consumers, not only from the source tree.

## Implementation procedure

1. Identify shared singleton/state.\n2. Test import and require separately.\n3. Decide single-source state strategy.\n4. Run consumer fixtures.

## Failure modes

Avoid:

- two copies of singleton state; divergent defaults; loader-specific side effects.
- Fixing compiler errors by weakening global safety contracts.
- Treating workspace symlinks or transpilers as equivalent to published Node resolution.

## Verification

1. Add a failing consumer/resolution contract test first.
2. Compile from a clean environment.
3. Test built or packed artifacts with real Node.js resolution.
4. Run the full repository gates.
5. Inspect the package tarball/public API for accidental files or entrypoints.
