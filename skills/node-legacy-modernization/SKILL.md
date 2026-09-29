---
name: node-legacy-modernization
description: Use when an older backend has accumulated obsolete patterns, unsupported runtimes, mixed module systems, or high-risk technical debt.
---

# Legacy Modernization

## Purpose

modernizing an existing Node.js backend without destabilizing behavior.

## Activate when

- an older backend has accumulated obsolete patterns, unsupported runtimes, mixed module systems, or high-risk technical debt.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

characterize before changing; separate compatibility work from feature work; prioritize operational risk; use seams instead of rewrites

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Inventory runtime/dependencies.
2. Map high-risk paths.
3. Add characterization tests.
4. Choose one migration seam.
5. Upgrade in compatibility steps.
6. Remove obsolete paths.
7. Verify production behavior.

## Failure modes

Avoid:

- big-bang rewrites; simultaneous runtime/framework/database migrations; removing undocumented behavior without evidence; ignoring deployment constraints.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
