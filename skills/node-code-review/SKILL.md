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

## Implementation procedure

1. Read surrounding code and tests.
2. Trace changed paths.
3. Check failure modes and concurrency.
4. Inspect data/API compatibility.
5. Verify tests cover changed behavior.
6. Report concrete findings tied to lines/behavior.

## Failure modes

Avoid:

- style-only review; approving because tests are green; assuming framework behavior; speculative findings without evidence.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
