---
name: adapter-graphql-codegen-client-preset
description: Use when the repository uses @graphql-codegen/client-preset.
---

# @graphql-codegen/client-preset adapter

## Purpose

Translate framework-neutral Node.js/TypeScript guidance into @graphql-codegen/client-preset-specific mechanics.

## Activate when

- @graphql-codegen/client-preset is present in the target repository.
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

1. Detect @graphql-codegen/client-preset and exact version.
2. Select the owning framework-neutral skill.
3. Apply the @graphql-codegen/client-preset-specific guidance below.
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

https://the-guild.dev/graphql/codegen/plugins/presets/preset-client

## Version scope

6.2.0.

## Adapter guidance

Use the client preset for typed GraphQL documents and operations. Treat the schema and operations as authoritative inputs, pin generator/plugin versions, and validate generated artifacts in CI.
