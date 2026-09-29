---
name: playwright adapter
description: Use when a target Node.js repository uses Playwright for API or end-to-end testing.
---

# playwright Adapter

## Purpose
Apply Node.js testing contracts using the repository's installed playwright toolchain.

## Activate when
- The dependency manifest identifies playwright.
- Existing tests or configuration use playwright.

## Repository inspection
Inspect package.json, lockfile, exact playwright version, configuration, module mode, test scripts, CI commands, and fixtures.

## Decision rules
- Detect installed version and existing project configuration.
- Use APIRequestContext for direct backend API testing when a browser is unnecessary.
- Prefer fixtures and built-in waiting/assertions over arbitrary sleeps.

## Implementation procedure
1. Detect the installed version and existing conventions.
2. Reuse repository configuration before adding configuration.
3. Add a focused failing test for changed behavior.
4. Implement using APIs supported by the detected version.
5. Run focused and full test suites.

## Failure modes
- Applying guidance for another major version.
- Replacing working repository conventions without evidence.
- Introducing flaky timing or global mutable fixtures.

## Verification
Prove deterministic CI execution, correct runtime/module behavior, isolated fixtures, and useful failure diagnostics.
