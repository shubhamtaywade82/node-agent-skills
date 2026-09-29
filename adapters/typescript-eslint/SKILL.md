---
name: adapter-typescript-eslint
description: Use when the repository uses typescript-eslint.
---

# typescript-eslint adapter

## Purpose

Translate framework-neutral Node.js/TypeScript guidance into typescript-eslint-specific mechanics.

## Activate when

- typescript-eslint is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, tsconfig files, Node.js version, and scripts.
2. Confirm the exact installed package version.
3. Locate lint, execution, codegen, or process-startup configuration.
4. Inspect CI and integration/consumer tests.

## Decision rules

- Core Node.js and TypeScript skills remain authoritative.
- Detect exact versions before using package-specific options.
- Development tooling must not silently become production runtime behavior.
- Generated output is verified as an artifact, not trusted because generation succeeded.

## Implementation procedure

1. Detect typescript-eslint and exact version.
2. Select the owning framework-neutral skill.
3. Apply the typescript-eslint-specific guidance below.
4. Add focused tests for the lint/build/codegen/runtime boundary.
5. Run the full repository gates.

## Failure modes

Avoid:

- Applying configuration from an incompatible major release.
- Using local developer state as a release contract.
- Treating transpilation or code generation as runtime validation.
- Hiding lifecycle or signal behavior behind tooling defaults.

## Verification

1. Run focused adapter-specific checks.
2. Run the repository's full test/build/typecheck gates.
3. Verify generated/runtime artifacts in a clean environment.
4. Review package/module configuration for unintended behavior.

## Source

https://typescript-eslint.io/

## Version scope

8.70.0.

## Adapter guidance

Use typescript-eslint for TypeScript-aware ESLint configuration. Keep parser/project-service settings aligned with the repository's TypeScript version and tsconfig topology; distinguish syntax-only linting from typed linting.
