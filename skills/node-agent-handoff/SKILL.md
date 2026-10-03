---
name: node-agent-handoff
description: Use when another coding agent or human must continue the work.
---

# Agent Handoff

## Purpose

transferring an unfinished backend task between agents or sessions without losing critical state.

## Activate when

- another coding agent or human must continue the work.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

handoff contains repository revision, objective, current findings, edits, tests, blockers, and exact next steps; source control remains authoritative

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Capture current SHA/branch.
2. Summarize changes.
3. List passing/failing gates.
4. Note assumptions.
5. Specify next safe action.
6. Verify branch state on takeover.

## Failure modes

Avoid:

- handoff without revision identity; stale assumptions; repeating already completed work.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
