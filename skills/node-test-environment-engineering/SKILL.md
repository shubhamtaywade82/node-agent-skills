---
name: node-test-environment-engineering
description: Use when integration/E2E tests require databases, queues, containers, credentials, or service emulators.
---

# Test Environment Engineering

## Purpose

making backend test environments reproducible across local development and CI.

## Activate when

- integration/E2E tests require databases, queues, containers, credentials, or service emulators.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

environment setup is declarative, isolated, disposable, and close to CI; credentials are ephemeral; service versions are explicit

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Inventory dependencies.
2. Define bootstrap/teardown.
3. Pin or detect versions.
4. Isolate ports/data.
5. Seed deterministic state.
6. Document local/CI parity.
7. Validate clean startup.

## Failure modes

Avoid:

- developer-specific global services; mutable shared databases; undocumented environment variables; tests that pass locally but not in CI.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
