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

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Characterize behavior.\n2. Choose one seam.\n3. Refactor incrementally.\n4. Run focused tests after each meaningful step.\n5. Update imports/contracts.\n6. Run the full suite.

## Failure modes

Avoid:

- rewriting entire modules; mixing feature work with refactors; removing tests; introducing abstractions without current pressure.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
