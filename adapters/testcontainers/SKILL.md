---
name: testcontainers adapter
description: Use when a target Node.js repository uses Testcontainers for real infrastructure integration tests.
---

# testcontainers Adapter

## Purpose
Apply Node.js testing contracts using the repository's installed testcontainers toolchain.

## Activate when
- The dependency manifest identifies testcontainers.
- Existing tests or configuration use testcontainers.

## Repository inspection
Inspect package.json, lockfile, exact testcontainers version, configuration, module mode, test scripts, CI commands, and fixtures.

## Decision rules
- Detect installed package versions and container-runtime assumptions.
- Use disposable dependencies and deterministic cleanup.
- Do not turn tests into permanent shared infrastructure.

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
