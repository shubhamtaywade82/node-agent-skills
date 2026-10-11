---
name: node-refactoring
description: Use when the task is to simplify, decouple, rename, relocate, or reduce complexity without changing behavior.
---

# Safe Refactoring

## Purpose

changing internal structure while preserving externally observable behavior.

## Activate when

- the task is to simplify, decouple, rename, relocate, or reduce complexity without changing behavior.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

define invariants first; change in small reversible steps; keep seams stable; avoid speculative abstraction

## Implementation procedure

1. Characterize behavior.
2. Choose one seam.
3. Refactor incrementally.
4. Run focused tests after each meaningful step.
5. Update imports/contracts.
6. Run the full suite.

## Failure modes

Avoid:

- rewriting entire modules; mixing feature work with refactors; removing tests; introducing abstractions without current pressure.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
