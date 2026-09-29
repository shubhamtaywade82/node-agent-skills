---
name: node-change-impact-analysis
description: Use when a change touches shared modules, public APIs, schemas, events, shared packages, or cross-service behavior.
---

# Change Impact Analysis

## Purpose

mapping affected contracts and dependent behavior before a backend change.

## Activate when

- a change touches shared modules, public APIs, schemas, events, shared packages, or cross-service behavior.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

impact is based on dependency evidence, not filename guesses; distinguish direct and transitive consumers; include runtime/config/test/deployment effects

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Trace imports and package dependencies.
2. Inspect API/schema consumers.
3. Identify config/infra coupling.
4. Classify compatibility risk.
5. Define affected tests and rollout order.

## Failure modes

Avoid:

- checking only changed files; missing generated consumers; assuming tests reveal every consumer; ignoring operational dependencies.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
