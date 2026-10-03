---
name: node-agent-context-budgeting
description: Use when a repository is large or multiple skills could apply.
---

# Agent Context Budgeting

## Purpose

controlling how much repository information an AI coding agent loads into context.

## Activate when

- a repository is large or multiple skills could apply.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

load minimum sufficient context; progressive disclosure beats repository dumps; prioritize authoritative files and direct consumers

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Start with manifests/router/tests.
2. Identify relevant modules.
3. Load only adjacent code.
4. Summarize stable facts.
5. Reopen source when facts may have changed.

## Failure modes

Avoid:

- loading entire repositories; stale summaries; omitting critical configuration to save tokens.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
