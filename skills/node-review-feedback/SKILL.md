---
name: node-review-feedback
description: Use when a reviewer requests changes on a backend PR.
---

# Review Feedback Integration

## Purpose

incorporating code-review findings without introducing unrelated changes or losing behavior.

## Activate when

- a reviewer requests changes on a backend PR.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

classify feedback as correctness, security, contract, maintainability, or preference; resolve with evidence; keep scope bounded

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Map comment to behavior.
2. Inspect surrounding code.
3. Implement smallest compliant change.
4. Add regression test when behavior is affected.
5. Respond with evidence.
6. Rerun gates.

## Failure modes

Avoid:

- blindly applying preferences; arguing without evidence; changing unrelated architecture; not retesting after review fixes.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
