---
name: adapter-openid-client
description: Use when the repository uses openid-client.
---

# openid-client adapter

## Purpose

Translate framework-neutral Node.js guidance into openid-client-specific mechanics.

## Activate when

- openid-client is present in the target repository.
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

1. Detect openid-client and exact version.
2. Select the owning framework-neutral skill.
3. Apply openid-client-specific APIs and lifecycle behavior.
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

https://github.com/panva/openid-client

## Version scope

current.

## Adapter guidance

Use when the repository prefers a higher-level Node.js OAuth/OIDC client. Detect exact installed version before using APIs; configure trusted issuers/redirects; validate authorization responses and tokens; handle key rotation and refresh/revocation; keep client secrets server-side.
