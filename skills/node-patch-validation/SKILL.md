---
name: node-patch-validation
description: Use when an agent has produced a patch, refactor, migration, or generated change.
---

# Patch Validation

## Purpose

validating AI-generated or batch code changes before they are accepted as correct.

## Activate when

- an agent has produced a patch, refactor, migration, or generated change.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

review the patch as a hypothesis; verify repository contracts, tests, generated artifacts, and diff scope; never equate compilation with correctness

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Inspect diff.
2. Check ownership and unintended files.
3. Run focused tests.
4. Run full gates.
5. Inspect generated/lockfile changes.
6. Verify security and compatibility.
7. Summarize residual risk.

## Failure modes

Avoid:

- rubber-stamping large diffs; testing only changed unit tests; ignoring generated files/lockfile changes; no rollback assessment.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
