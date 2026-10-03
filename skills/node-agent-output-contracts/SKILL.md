---
name: node-agent-output-contracts
description: Use when downstream humans or automation consumes the agent's result.
---

# Agent Output Contracts

## Purpose

producing structured, factual outputs from coding-agent workflows.

## Activate when

- downstream humans or automation consumes the agent's result.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

outputs distinguish changed files, tests, decisions, failures, and residual risk; no fabricated completion states

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Define output schema.
2. Report actual revisions.
3. Include executed commands.
4. Summarize evidence.
5. Identify remaining uncertainty.
6. Keep output stable.

## Failure modes

Avoid:

- mixing plans with verified results; omitting failed checks; claiming deployment when only local validation occurred.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
