---
name: node-monorepo-engineering
description: Use when a repository contains multiple packages/apps, workspace protocols, task graphs, or shared tooling.
---

# Monorepo Engineering

## Purpose

designing or changing multi-package Node.js workspaces with explicit dependency and task boundaries.

## Activate when

- a repository contains multiple packages/apps, workspace protocols, task graphs, or shared tooling.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

make package ownership explicit; prefer package-level APIs; keep dependency direction intentional; avoid accidental hoisting assumptions; optimize CI from dependency graphs

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Discover workspace manager.\n2. Map package graph.\n3. Define public package exports.\n4. Enforce internal dependency policy.\n5. Align build/test task dependencies.\n6. Isolate package-local config.\n7. Verify affected packages and full CI.

## Failure modes

Avoid:

- deep cross-package imports; implicit hoisted dependencies; circular workspace dependencies; caching tasks with hidden inputs.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
