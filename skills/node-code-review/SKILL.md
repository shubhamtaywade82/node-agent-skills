---
name: node-code-review
description: Use when you are reviewing a PR, patch, generated change, or AI-produced implementation.
---

# Backend Code Review

## Purpose

reviewing Node.js/TypeScript changes for correctness, security, reliability, and maintainability.

## Activate when

- you are reviewing a PR, patch, generated change, or AI-produced implementation.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

review behavior before style; inspect trust boundaries, async lifecycle, persistence, compatibility, security, and tests; distinguish must-fix defects from preferences

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Read surrounding code and tests.\n2. Trace changed paths.\n3. Check failure modes and concurrency.\n4. Inspect data/API compatibility.\n5. Verify tests cover changed behavior.\n6. Report concrete findings tied to lines/behavior.

## Failure modes

Avoid:

- style-only review; approving because tests are green; assuming framework behavior; speculative findings without evidence.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
