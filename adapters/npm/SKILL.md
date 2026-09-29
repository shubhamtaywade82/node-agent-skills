---
name: npm adapter
description: Use when a target Node.js repository uses npm and the agent must apply npm-specific dependency, workspace, script, or publishing guidance.
---

# npm Adapter

## Purpose
Translate package and supply-chain contracts into npm-specific repository operations.

## Activate when
- package-lock.json or npm scripts are present.
- npm workspaces or publishing are being changed.

## Repository inspection
Inspect package.json, package-lock.json, npm version, scripts, workspaces, registry settings, and CI install/publish commands.

## Decision rules
- Preserve package-lock.json as the authoritative resolution file.
- Use clean/immutable CI installation when compatible with the repository.
- Review lifecycle scripts as executable dependency code.
- Prefer npm trusted publishing/OIDC over long-lived tokens when supported.
- Do not rewrite package metadata just to impose a preferred workflow.

## Implementation procedure
1. Detect npm version and package metadata.
2. Use repository-native install/test/build scripts.
3. Change package.json and lockfile together.
4. Verify workspaces and exports with a clean install.
5. Verify publish permissions/provenance without production secrets.

## Failure modes
- A different npm version silently rewrites the lockfile.
- Scripts depend on undeclared global binaries.
- Publish credentials are broader than necessary.

## Verification
Run clean installation, tests, packaging checks, and a non-secret publish/provenance validation where supported.