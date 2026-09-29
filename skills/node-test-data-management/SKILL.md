---
name: node-test-data-management
description: Use when tests need fixtures, factories, seeds, snapshots, or realistic data.
---

# Test Data Management

## Purpose

creating deterministic, isolated, privacy-safe test data for backend suites.

## Activate when

- tests need fixtures, factories, seeds, snapshots, or realistic data.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

test data is minimal, deterministic, isolated, and safe; factories encode valid invariants; production data is never copied casually

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Identify data dependencies.
2. Create builders/factories.
3. Define ownership/cleanup.
4. Use synthetic identifiers.
5. Seed only required baselines.
6. Verify parallel-test isolation.

## Failure modes

Avoid:

- shared mutable fixtures; production PII in tests; random values without reproducibility; hidden database state.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
