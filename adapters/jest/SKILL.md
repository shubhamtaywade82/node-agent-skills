---
name: jest adapter
description: Use when a target Node.js repository uses Jest for unit or integration testing.
---

# jest Adapter

## Purpose
Apply Node.js testing contracts using the repository's installed jest toolchain.

## Activate when
- The dependency manifest identifies jest.
- Existing tests or configuration use jest.

## Repository inspection
Inspect package.json, lockfile, exact jest version, configuration, module mode, test scripts, CI commands, and fixtures.

## Decision rules
- Detect the installed version and module mode first.
- Keep ESM, TypeScript, and transform settings aligned with the repository.
- Do not assume Babel or ts-jest without evidence.

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
