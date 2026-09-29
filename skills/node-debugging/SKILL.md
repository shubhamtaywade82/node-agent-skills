---
name: node-debugging
description: Use when a bug, regression, incident symptom, flaky behavior, or unexplained runtime failure is being investigated.
---

# Production Debugging

## Purpose

reproducing and diagnosing Node.js backend defects without masking root causes.

## Activate when

- a bug, regression, incident symptom, flaky behavior, or unexplained runtime failure is being investigated.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

reproduce before fixing; capture inputs and environment; form falsifiable hypotheses; prefer observability over guesswork; preserve the failing case

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Capture exact error and request/job context.\n2. Minimize reproduction.\n3. Inspect logs/traces/metrics.\n4. Test hypotheses.\n5. Add regression test.\n6. Implement minimal fix.\n7. Verify no adjacent regressions.

## Failure modes

Avoid:

- changing multiple variables at once; swallowing exceptions; adding retries to hide failures; debugging only from stack traces.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
