---
name: node-migration-assistant
description: Use when a data, runtime, framework, package, API, or infrastructure migration needs coordinated steps.
---

# Migration Planning

## Purpose

planning executable backend migrations with preconditions, compatibility windows, and rollback.

## Activate when

- a data, runtime, framework, package, API, or infrastructure migration needs coordinated steps.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

migration plans are executable and ordered; mixed-version compatibility is explicit; rollback differs from roll-forward when irreversible work exists

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Define current/target state.
2. Identify blockers.
3. Split into phases.
4. Specify commands and checks.
5. Identify irreversible steps.
6. Define rollback/roll-forward.
7. Attach verification to each phase.

## Failure modes

Avoid:

- one-step migration plans; undocumented manual edits; rollback claims for irreversible changes; no validation checkpoints.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
