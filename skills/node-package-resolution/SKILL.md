---
name: node-package-resolution
description: Use when ESM/CJS, exports, workspace links, conditional exports, or duplicate dependency versions cause runtime/build issues.
---

# Node Package Resolution

## Purpose

debugging and controlling Node.js package/module resolution in complex repositories.

## Activate when

- ESM/CJS, exports, workspace links, conditional exports, or duplicate dependency versions cause runtime/build issues.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

resolution is determined by Node/package-manager rules, not editor intuition; package boundaries and `exports` are explicit

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Inspect package type/exports/imports.
2. Use Node resolution diagnostics.
3. Inspect lockfile/workspace graph.
4. Eliminate accidental duplicate versions.
5. Test published-package shape.

## Failure modes

Avoid:

- deep imports into private paths; relying on source layout; mixing incompatible ESM/CJS assumptions.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
