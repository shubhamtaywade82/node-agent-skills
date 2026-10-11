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

## Implementation procedure

1. Capture exact error and request/job context.
2. Minimize reproduction.
3. Inspect logs/traces/metrics.
4. Test hypotheses.
5. Add regression test.
6. Implement minimal fix.
7. Verify no adjacent regressions.

## Failure modes

Avoid:

- changing multiple variables at once; swallowing exceptions; adding retries to hide failures; debugging only from stack traces.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
