---
name: node-documentation-engineering
description: Use when README, architecture docs, API docs, runbooks, migration notes, or operational references are being created or changed.
---

# Backend Documentation Engineering

## Purpose

keeping backend documentation accurate, operationally useful, and connected to executable behavior.

## Activate when

- README, architecture docs, API docs, runbooks, migration notes, or operational references are being created or changed.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

document decisions and contracts, not obvious syntax; prefer generated/executable sources where possible; label assumptions and version scope

## Implementation procedure

1. Identify audience and owner.
2. Document contract and failure modes.
3. Link to source/config.
4. Add command examples.
5. Validate examples.
6. Update affected docs with behavior changes.

## Failure modes

Avoid:

- copying stale snippets; undocumented breaking changes; runbooks without symptoms/actions; versionless framework advice.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
