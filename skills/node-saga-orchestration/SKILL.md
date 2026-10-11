---
name: node-saga-orchestration
description: Use when a business operation spans multiple services and cannot be completed atomically with one database transaction.
---

# Saga Orchestration

## Purpose

coordinating long-running multi-service workflows with explicit compensations.

## Activate when

- a business operation spans multiple services and cannot be completed atomically with one database transaction.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

model workflow state explicitly; each forward step and compensation must be idempotent; use timeouts and durable state; surface manual intervention when compensation is impossible

## Implementation procedure

1. Define state machine.
2. Assign ownership.
3. Persist step status.
4. Use outbox/queues for progression.
5. Make each command idempotent.
6. Implement compensation and timeout paths.
7. Add reconciliation.

## Failure modes

Avoid:

- distributed transaction pretence; non-repeatable compensation; in-memory workflow state; missing timeout/manual path.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
