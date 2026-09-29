---
name: node-developer-experience
description: Use when onboarding, local setup, scripts, fixtures, dev containers, CI feedback, or developer ergonomics are being improved.
---

# Backend Developer Experience

## Purpose

improving local development feedback without weakening production correctness.

## Activate when

- onboarding, local setup, scripts, fixtures, dev containers, CI feedback, or developer ergonomics are being improved.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

optimize time-to-first-valid-change; make environment assumptions explicit; preserve parity with CI/production; avoid hidden state

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Measure current friction.\n2. Consolidate canonical commands.\n3. Add deterministic fixtures.\n4. Improve failure messages.\n5. Document required services.\n6. Verify clean-checkout setup.

## Failure modes

Avoid:

- works only on one machine; hidden global tools; network-dependent tests; scripts that mutate shared data unexpectedly.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
