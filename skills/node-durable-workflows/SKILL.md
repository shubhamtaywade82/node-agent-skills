---
name: node-durable-workflows
description: Use when workflows span minutes/hours/days, external systems, timers, retries, or human steps.
---

# Durable Workflow Engineering

## Purpose

orchestrating long-running business processes with persisted execution state and deterministic recovery.

## Activate when

- workflows span minutes/hours/days, external systems, timers, retries, or human steps.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

workflow state is durable; activities have explicit side effects and idempotency; timers/retries have bounded semantics; workers can restart without losing progress

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Define workflow state machine.
2. Separate deterministic orchestration from side effects.
3. Persist checkpoints.
4. Define retries/timeouts.
5. Support cancellation/compensation.
6. Add recovery/replay tests.

## Failure modes

Avoid:

- in-memory workflow state; non-deterministic orchestration; unbounded retries; side effects executed twice without idempotency.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
