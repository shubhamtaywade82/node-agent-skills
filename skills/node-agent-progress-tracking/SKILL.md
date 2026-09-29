---
name: node-agent-progress-tracking
description: Use when a task spans multiple dependent actions, tests, or review cycles.
---

# Agent Progress Tracking

## Purpose

maintaining an explicit implementation state while an AI coding agent performs a multi-step backend change.

## Activate when

- a task spans multiple dependent actions, tests, or review cycles.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

progress records completed/blocked/next work without pretending unverified work is done; state is resumable and factual

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Define milestones.
2. Record completed evidence.
3. Separate planned from verified.
4. Capture failures.
5. Maintain next action.
6. Update after meaningful changes.

## Failure modes

Avoid:

- marking tasks complete before verification; losing failure context; progress logs that become a second source of truth.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
