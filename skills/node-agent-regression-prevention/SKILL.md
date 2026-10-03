---
name: node-agent-regression-prevention
description: Use when the change touches code with known regressions or adjacent behavior.
---

# Agent Regression Prevention

## Purpose

ensuring an AI-generated backend change does not silently reintroduce previously fixed defects.

## Activate when

- the change touches code with known regressions or adjacent behavior.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

reproduce important old failures; preserve regression tests; review nearby invariants; compare before/after behavior

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Identify historical regression tests.
2. Add missing invariant tests.
3. Run targeted suite.
4. Inspect edge cases.
5. Run full gates.

## Failure modes

Avoid:

- deleting flaky-looking regression tests; assuming unchanged code cannot regress; only testing the happy path.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
