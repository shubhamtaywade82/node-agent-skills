---
name: node-data-archival
description: Use when retention or scale requires archive tiers or historical partitions.
---

# Data Archival

## Purpose

moving cold data out of primary operational stores while preserving legal, audit, and restore requirements.

## Activate when

- retention or scale requires archive tiers or historical partitions.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

archival is a state transition with explicit ownership and recoverability; deletion from hot storage follows verified archive durability; access remains authorized

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Define archive eligibility.
2. Write archive copy.
3. Verify integrity.
4. Mark/archive state.
5. Remove hot copy only after confirmation.
6. Provide restore tooling.
7. Instrument lag and failures.

## Failure modes

Avoid:

- deleting before durable archive; archive without checksums/identity; bypassing authorization during restore.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
