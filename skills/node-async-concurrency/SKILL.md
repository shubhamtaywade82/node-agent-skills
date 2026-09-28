---
name: node-async-concurrency
description: runtime
---

# Node Async Concurrency

## Purpose
Use when Node.js code performs parallel asynchronous work, Promise fan-out, cancellation, deadlines, timeouts, or race-sensitive operations.

## Activate when
Make asynchronous work bounded, cancellable, and correct under partial completion.

## Repository inspection
- Promise combinators over dynamic collections.
- Parallel external calls.
- Cancellation or race handling.

## Decision rules
Inspect workload size, downstream capacity, timeout policy, cancellation propagation, and shared mutable state.

## Implementation procedure
- Bound concurrency when work scales with input.
- Prefer propagated AbortSignal or deadlines over arbitrary sleeps.
- Choose fail-fast versus best-effort fan-out explicitly.
- Protect shared state with atomic operations or a clear owner.
- Treat cancellation as expected control flow where applicable.

## Failure modes
1. Define concurrency budget.
2. Define success, failure, and cancellation semantics.
3. Implement bounded scheduling.
4. Propagate cancellation and deadlines.
5. Test partial failure, cancellation, timeout, and duplicate execution.

## Verification
- Unbounded Promise fan-out.
- Swallowed cancellation.
- Retry storms.
- Races on shared state.

## Source foundation
Prove concurrency-limit enforcement and failure semantics. Load-test when capacity is material.
