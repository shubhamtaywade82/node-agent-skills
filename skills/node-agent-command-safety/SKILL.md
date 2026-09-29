---
name: node-agent-command-safety
description: Use when an AI coding agent needs to execute migrations, tests, scripts, package commands, or deployment actions.
---

# Agent Command Safety

## Purpose

running shell and repository commands with bounded scope and clear side effects.

## Activate when

- an AI coding agent needs to execute migrations, tests, scripts, package commands, or deployment actions.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

commands are classified by read/write/destructive impact; destructive commands require explicit task justification and safe environment

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Inspect command.
2. Identify working directory.
3. Preview destructive operations.
4. Use dry-run where available.
5. Bound input/output.
6. Capture exit status.

## Failure modes

Avoid:

- running production commands from local context; piping untrusted data into shells; destructive commands without confirmation/rollback.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
