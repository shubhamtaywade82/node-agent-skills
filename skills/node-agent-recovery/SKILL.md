---
name: node-agent-recovery
description: Use when an agent task is left in an uncertain or partially modified state.
---

# Agent Recovery

## Purpose

recovering a coding-agent workflow after tool failure, partial patch, test regression, or interrupted work.

## Activate when

- an agent task is left in an uncertain or partially modified state.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

recovery starts from repository truth; inspect working tree/diff; restore known-good state where appropriate; re-run relevant gates

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Inspect branch/status/diff.
2. Identify last verified state.
3. Isolate partial changes.
4. Restore or continue safely.
5. Rerun focused/full validation.

## Failure modes

Avoid:

- blindly retrying commands; deleting useful partial work; continuing from an unknown repository state.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
