---
name: node-merge-conflict-resolution
description: Use when a backend branch cannot cleanly merge or rebase onto its target.
---

# Merge Conflict Resolution

## Purpose

resolving Git conflicts by preserving intended behavior from both branches and revalidating contracts.

## Activate when

- a backend branch cannot cleanly merge or rebase onto its target.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

conflict markers are symptoms of divergent history; resolve semantically; never choose ours/theirs blindly; rerun tests after resolution

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Inspect merge base and branch intent.
2. Identify overlapping contract changes.
3. Resolve each file by behavior.
4. Remove markers.
5. Compare final diff to both parents.
6. Run full validation.

## Failure modes

Avoid:

- accepting one side wholesale; resolving only syntax; losing registry entries or tests; skipping CI.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
