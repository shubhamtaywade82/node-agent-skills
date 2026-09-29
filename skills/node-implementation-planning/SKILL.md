---
name: node-implementation-planning
description: Use when the task needs more than a localized edit or has compatibility/migration/testing implications.
---

# Agent Implementation Planning

## Purpose

turning an approved backend change into an executable implementation plan with explicit constraints.

## Activate when

- the task needs more than a localized edit or has compatibility/migration/testing implications.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

plan from observed repository state; include behavior, files/boundaries, tests, rollout, and failure paths; avoid speculative files

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. State current behavior.
2. Define target contract.
3. Enumerate affected boundaries.
4. Choose sequence.
5. Define tests and verification.
6. Identify rollback/operational implications.

## Failure modes

Avoid:

- plans detached from actual code; invented file paths; missing failure cases; implementation before contract understanding.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
