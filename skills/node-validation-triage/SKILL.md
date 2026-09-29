---
name: node-validation-triage
description: Use when a quality gate fails and multiple symptoms may be related.
---

# Validation Failure Triage

## Purpose

diagnosing CI/test/validator failures after repository changes.

## Activate when

- a quality gate fails and multiple symptoms may be related.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

fix the earliest causal failure; use logs and exact assertions; distinguish contract drift from implementation defects; never silence a validator to restore green

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Identify failing job/step.
2. Inspect exact assertion/log.
3. Reproduce locally if possible.
4. Trace to changed contract.
5. Fix root cause.
6. Rerun only relevant gate after each change.

## Failure modes

Avoid:

- fixing downstream failures first; broad unrelated changes; weakening tests; relying on reruns without code change.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
