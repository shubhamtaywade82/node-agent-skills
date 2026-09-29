---
name: node-flaky-test-engineering
description: Use when a test intermittently fails due to timing, ordering, concurrency, network, time, or leaked state.
---

# Flaky Test Engineering

## Purpose

diagnosing and eliminating nondeterministic backend tests rather than quarantining failures.

## Activate when

- a test intermittently fails due to timing, ordering, concurrency, network, time, or leaked state.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

flakiness is a defect in test determinism or the system contract; capture reproduction evidence; do not increase arbitrary sleeps

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Classify failure source.
2. Run targeted repeats only to reproduce.
3. Control time/order/concurrency.
4. Isolate resources.
5. Fix underlying nondeterminism.
6. Retain regression coverage.

## Failure modes

Avoid:

- blind retries in CI; long sleeps; disabling tests; order-dependent state; global mutable mocks.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
