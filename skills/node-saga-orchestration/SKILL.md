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

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define state machine.\n2. Assign ownership.\n3. Persist step status.\n4. Use outbox/queues for progression.\n5. Make each command idempotent.\n6. Implement compensation and timeout paths.\n7. Add reconciliation.

## Failure modes

Avoid:

- distributed transaction pretence; non-repeatable compensation; in-memory workflow state; missing timeout/manual path.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
