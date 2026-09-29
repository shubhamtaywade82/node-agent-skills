---
name: node-api-deprecation
description: Use when an endpoint, field, parameter, header, or version is being deprecated or removed.
---

# API Deprecation

## Purpose

retiring backend API behavior with explicit compatibility windows and observability.

## Activate when

- an endpoint, field, parameter, header, or version is being deprecated or removed.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

deprecation is a contract change; communicate scope/timeline; measure usage; preserve safe overlap; remove only after evidence

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Identify consumers.
2. Add deprecation metadata.
3. Instrument usage.
4. Document migration path.
5. Maintain compatibility window.
6. Gate removal on evidence.
7. Verify old/new clients.

## Failure modes

Avoid:

- silent removal; deprecation with no migration path; measuring only server errors; breaking generated clients unexpectedly.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
