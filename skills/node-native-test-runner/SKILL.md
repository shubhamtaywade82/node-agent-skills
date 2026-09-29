---
name: node-native-test-runner
description: Use when the repository uses or evaluates the `node:test` runner.
---

# Node Native Test Runner

## Purpose

using Node's built-in test runner for TypeScript/JavaScript backend tests without unnecessary framework coupling.

## Activate when

- the repository uses or evaluates the `node:test` runner.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

use repository-supported Node version; use subtests/concurrency deliberately; isolate tests; use built-in mocks only when appropriate; do not assume another runner's APIs

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Inspect Node version and scripts.
2. Structure tests around behavior.
3. Use `node:test` fixtures/mocks.
4. Configure reporters/coverage as supported.
5. Verify parallel isolation.
6. Keep tests deterministic.

## Failure modes

Avoid:

- copying Jest/Vitest APIs into node:test; shared mutable state; relying on current-working-directory quirks.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
