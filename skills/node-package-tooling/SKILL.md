---
name: node-package-tooling
description: Use when changing package.json scripts, package exports, engines, workspace structure, package-manager commands, npm publishing behavior, or Node.js module packaging.
---

# Package Tooling

## Purpose
Keep package metadata, module boundaries, scripts, and runtime requirements aligned with how the repository is built and consumed.

## Activate when
- Changing package.json, exports/imports, scripts, or workspaces.
- Converting between ESM and CommonJS.
- Publishing a library or executable package.

## Repository inspection
Inspect package manager files, package.json, lockfile, type declarations, build output, engines, exports, scripts, workspaces, and consumer imports.

## Decision rules
| Concern | Rule |
|---|---|
| Package manager | Use the repository's existing manager and metadata. |
| Exports | Treat the exports map as the public module boundary. |
| Engines | Declare runtime requirements the code genuinely needs. |
| Scripts | Keep lifecycle scripts deterministic and safe in CI. |
| Types | Published declaration paths must match public exports. |
| Monorepo | Define workspace boundaries and dependency direction explicitly. |

## Implementation procedure
1. Discover package-manager and workspace conventions.
2. Model public entrypoints and internal-only modules.
3. Align build output, declarations, exports, and engines.
4. Update scripts and lockfiles together.
5. Test clean installation and public imports.
6. Review package contents before publishing.

## Failure modes
- Deep imports work locally but are blocked by exports.
- package.json and CI use different Node versions.
- Declarations point to files missing from the package.
- Lifecycle scripts depend on global developer tools.

## Verification
Test clean install, build, type resolution, public imports, package contents, and declared runtime requirements.