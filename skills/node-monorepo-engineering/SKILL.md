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

## Implementation procedure

1. Discover workspace manager.
2. Map package graph.
3. Define public package exports.
4. Enforce internal dependency policy.
5. Align build/test task dependencies.
6. Isolate package-local config.
7. Verify affected packages and full CI.

## Failure modes

Avoid:

- deep cross-package imports; implicit hoisted dependencies; circular workspace dependencies; caching tasks with hidden inputs.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
