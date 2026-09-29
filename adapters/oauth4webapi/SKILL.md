---
name: adapter-oauth4webapi
description: Use when the repository uses oauth4webapi.
---

# oauth4webapi adapter

## Purpose

Translate framework-neutral Node.js guidance into oauth4webapi-specific mechanics.

## Activate when

- oauth4webapi is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, Node.js version, imports, and test/auth construction.
2. Confirm the exact installed version.
3. Locate lifecycle ownership and existing integration boundaries.
4. Read neighboring tests and CI scripts.

## Decision rules

- Core skills remain authoritative for correctness, security, retries, observability, and architecture.
- Do not infer APIs from memory when the package version is not confirmed.
- Treat provider/network data as untrusted runtime input.
- Keep secrets and tokens out of logs and test artifacts.

## Implementation procedure

1. Detect oauth4webapi and exact version.
2. Select the owning framework-neutral skill.
3. Apply oauth4webapi-specific APIs and lifecycle behavior.
4. Add focused boundary tests including failure and cleanup.
5. Verify CI and production configuration.

## Failure modes

- Examples copied from incompatible versions.
- Hidden lifecycle/resource leaks.
- Tests that assert framework internals rather than observable behavior.
- Credentials or tokens appearing in diagnostics.

## Verification

1. Run focused adapter tests.
2. Run the full repository test suite.
3. Run build/typecheck gates.
4. Verify failure, cleanup, and security behavior.

## Source

https://github.com/panva/oauth4webapi

## Version scope

3.x.

## Adapter guidance

Use the low-level OAuth/OIDC primitives when the application needs explicit protocol control. Validate issuer/metadata, use PKCE/state/nonce as required, keep tokens out of logs, and separate protocol validation from local identity/authorization.
