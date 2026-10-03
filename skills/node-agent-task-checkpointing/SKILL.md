---
name: node-agent-task-checkpointing
description: Use when a task may be interrupted, require multiple sessions, or involve risky migrations.
---

# Agent Task Checkpointing

## Purpose

creating resumable checkpoints during long coding-agent tasks.

## Activate when

- a task may be interrupted, require multiple sessions, or involve risky migrations.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

checkpoint state contains repository revision, completed gates, pending work, and assumptions; checkpoints do not replace source control

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Capture commit/revision.
2. Record tests/gates.
3. Document pending files/decisions.
4. Resume from current tree.
5. Revalidate stale assumptions.

## Failure modes

Avoid:

- checkpointing prose without revision identity; resuming after branch drift without revalidation.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
