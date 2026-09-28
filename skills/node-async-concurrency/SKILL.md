---
name: node-async-concurrency
description: Use when Node.js code performs parallel asynchronous work, Promise fan-out, cancellation, deadlines, timeouts, or race-sensitive operations.
---

# Node Async Concurrency

## Purpose
Make asynchronous work bounded, cancellable, and correct under partial completion.

## Activate when
Use Promise combinators over dynamic collections, call external services in parallel, or handle cancellation/races.

## Repository inspection
Inspect workload size, downstream capacity, timeout policy, cancellation propagation, and shared mutable state.

## Decision rules
Bound concurrency when work scales with input. Prefer AbortSignal/deadlines over arbitrary sleeps. Choose fail-fast versus best-effort explicitly. Protect shared state atomically or through one owner.

## Implementation procedure
1. Define concurrency budget. 2. Define success/failure/cancellation semantics. 3. Implement bounded scheduling. 4. Propagate cancellation. 5. Test partial failure, cancellation, timeout, and duplicates.

## Failure modes
Unbounded Promise fan-out; swallowed cancellation; retry storms; shared-state races.

## Verification
Prove concurrency-limit enforcement and failure semantics; load-test when capacity matters.

## Source foundation
https://nodejs.org/api/globals.html#class-abortcontroller
