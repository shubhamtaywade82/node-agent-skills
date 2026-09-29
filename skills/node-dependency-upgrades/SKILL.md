---
name: node-dependency-upgrades
description: Use when a dependency or runtime version needs to be upgraded, replaced, or unblocked.
---

# Dependency Upgrades

## Purpose

upgrading Node.js dependencies safely across runtime, build, and production constraints.

## Activate when

- a dependency or runtime version needs to be upgraded, replaced, or unblocked.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

detect actual versions first; read release/migration notes; inspect peer/engine constraints; update lockfile deliberately; test both direct and integration behavior

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Inventory dependency graph.\n2. Identify breaking changes.\n3. Update one compatibility cluster.\n4. Regenerate lockfile with project package manager.\n5. Run unit/integration/build checks.\n6. Verify deployment/runtime constraints.\n7. Document rollback.

## Failure modes

Avoid:

- blind latest-version bumps; partial lockfile edits; ignoring peer dependencies; testing only compilation.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
