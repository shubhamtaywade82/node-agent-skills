---
name: node-architecture-decision-records
description: Use when an architectural choice affects boundaries, dependencies, persistence, messaging, deployment, or long-term operations.
---

# Architecture Decision Records

## Purpose

capturing durable backend architecture decisions and their trade-offs.

## Activate when

- an architectural choice affects boundaries, dependencies, persistence, messaging, deployment, or long-term operations.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

record context, decision, alternatives, consequences, and status; link evidence; keep ADRs small and update superseding decisions rather than rewriting history

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Identify decision owner.
2. Document constraints.
3. Compare viable alternatives.
4. Record chosen decision and consequences.
5. Link implementation and follow-up.

## Failure modes

Avoid:

- ADRs as tutorials; recording implementation details without the decision; hiding rejected alternatives; stale status.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
