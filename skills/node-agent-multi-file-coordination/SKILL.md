---
name: node-agent-multi-file-coordination
description: Use when a feature touches contracts, implementation, tests, generated files, or deployment configuration.
---

# Agent Multi-File Coordination

## Purpose

coordinating a change that spans multiple Node.js/TypeScript modules while preserving dependency order.

## Activate when

- a feature touches contracts, implementation, tests, generated files, or deployment configuration.
- The work spans multiple files, tools, sessions, or verification stages.

## Repository inspection

1. Detect runtime, package manager, framework, test commands, CI, and repository state.
2. Identify authoritative source files and existing agent/workflow conventions.
3. Inspect current branch/revision and working-tree changes before mutation.
4. Locate tests, generated artifacts, and operational gates relevant to the change.

## Decision rules

changes are ordered by dependency; source-of-truth files are updated before generated/derived files; intermediate states are testable

- Repository state and executed commands are the source of truth.
- Separate planned actions from verified outcomes.
- Keep changes bounded, reversible, and auditable.
- Revalidate facts after interruptions, rebases, merges, or major branch changes.

## Implementation procedure

1. Map affected files.
2. Identify dependency order.
3. Implement contract first.
4. Update implementations.
5. Regenerate derived artifacts.
6. Run layered tests.
7. Inspect final diff.

## Failure modes

Avoid:

- editing generated files first; circular partial changes; tests updated only after implementation without contract coverage.
- Repeating work from stale context.
- Treating agent notes or summaries as a substitute for source control/tests.

## Verification

1. Add a failing contract/regression test for new behavior.
2. Verify repository state before and after meaningful changes.
3. Run focused tests, then complete repository gates.
4. Inspect the final diff and current revision.
5. Report exactly what is verified and what remains uncertain.
