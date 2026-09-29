---
name: adapter-graphql-request
description: Use when the repository uses graphql-request.
---

# graphql-request adapter

## Purpose

Translate framework-neutral Node.js guidance into graphql-request-specific mechanics.

## Activate when

- graphql-request is present in the target repository.
- The detected version matches or is explicitly verified against the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, Node.js version, module type, and build/runtime scripts.
2. Confirm the exact installed package version.
3. Locate the owning build, execution, or API-client configuration.
4. Inspect tests and CI commands that exercise the artifact or integration.

## Decision rules

- Core Node.js skills remain authoritative.
- Detect versions before using adapter-specific options.
- Keep generated/build output reproducible.
- Do not turn development tooling into an implicit production dependency.

## Implementation procedure

1. Detect graphql-request and exact version.
2. Select the owning framework-neutral skill.
3. Apply the graphql-request-specific guidance below.
4. Add focused tests for the generated artifact, runtime path, or integration.
5. Run the full repository validation gates.

## Failure modes

Avoid:

- Applying options from incompatible releases.
- Hidden environment dependence in build output or scripts.
- Assuming generated/bundled JavaScript provides type safety by itself.
- Shipping development-only tooling without an explicit runtime contract.

## Verification

1. Run focused tests.
2. Verify generated/build output from a clean environment.
3. Run the full suite, typecheck/build, and repository validator.
4. Inspect package exports, source maps, and runtime entrypoints where relevant.

## Source

https://github.com/graffle-js/graffle/tree/graphql-request

## Version scope

7.4.0.

## Adapter guidance

Use graphql-request for lightweight GraphQL client integrations. Preserve cancellation, headers, error policy, and typed document contracts explicitly; for TypeScript ESM projects honor its package-exports/module-resolution requirements.
