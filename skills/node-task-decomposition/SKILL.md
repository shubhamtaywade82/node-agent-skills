---
name: node-task-decomposition
description: Use when a coding-agent task spans multiple components, contracts, tests, or deployment layers.
---

# Agent Task Decomposition

## Purpose

breaking a backend request into bounded implementation tasks while preserving architectural ownership.

## Activate when

- a coding-agent task spans multiple components, contracts, tests, or deployment layers.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

decompose by behavior and boundary, not by arbitrary file count; each task has a verifiable outcome; sequencing follows dependency constraints

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. State the desired outcome.
2. Identify affected boundaries.
3. Split into independently testable slices.
4. Order by dependencies.
5. Mark risky assumptions.
6. Define stop conditions.

## Failure modes

Avoid:

- creating too many micro-tasks; mixing unrelated refactors; ordering by filenames instead of dependencies; no verification criterion.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
