---
name: adapter-tsdown
description: Use when the repository uses tsdown.
---

# tsdown adapter

## Purpose

Translate framework-neutral Node.js/TypeScript guidance into tsdown-specific mechanics.

## Activate when

- tsdown is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, tsconfig files, Node.js version, and build/test scripts.
2. Confirm the exact installed package version.
3. Locate the owning compile/bundle/codegen configuration.
4. Inspect generated artifacts, runtime entrypoints, and CI verification.

## Decision rules

- Core Node.js and TypeScript skills remain authoritative.
- Detect exact versions before applying adapter options.
- Generated/bundled output is not a substitute for runtime validation.
- Build output must be reproducible and testable as an installed consumer where applicable.

## Implementation procedure

1. Detect tsdown and exact version.
2. Select the owning framework-neutral skill.
3. Apply the tsdown-specific mechanics below.
4. Add focused compiler/build/codegen tests.
5. Run the full repository gates.

## Failure modes

Avoid:

- Applying options from incompatible releases.
- Assuming transpilation performs typechecking.
- Generating artifacts from mutable environment state.
- Shipping build output that is not exercised by tests.

## Verification

1. Run focused build/codegen/consumer tests.
2. Verify clean output from a clean environment.
3. Run typecheck/build/test and the repository validator.
4. Inspect package exports, source maps, generated files, and runtime compatibility.

## Source

https://tsdown.dev/

## Version scope

0.23.0.

## Adapter guidance

Use tsdown for TypeScript/JavaScript library bundling when the repository selects it. It is powered by Rolldown and can generate declarations; build-time Node requirements are distinct from the runtime target. Prefer it as a modern alternative when migrating from tsup.
