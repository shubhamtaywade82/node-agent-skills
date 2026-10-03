---
name: node-agent-tool-selection
description: Use when an agent can access multiple tools and must choose the safest effective one.
---

# Agent Tool Selection

## Purpose

choosing repository, test, search, and inspection tools deliberately during backend work.

## Activate when

- an agent can access multiple tools and must choose the safest effective one.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

tool choice follows evidence need and scope; read-only inspection precedes mutation; repository-native commands are preferred

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. State information need.
2. Choose smallest tool.
3. Inspect result.
4. Escalate to write-capable tool only when necessary.
5. Record verification.

## Failure modes

Avoid:

- using write tools for discovery; broad searches when exact inspection is available; hiding tool failures.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
