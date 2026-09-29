---
name: node-message-delivery
description: Use when a service sends commands/events or consumes messages.
---

# Message Delivery Semantics

## Purpose

making message publish/consume behavior explicit across queues and brokers.

## Activate when

- a service sends commands/events or consumes messages.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

delivery mode, ordering, durability, duplicate behavior, and acknowledgement semantics are part of the contract

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Define message identity and delivery guarantees.
2. Choose ack/commit point.
3. Persist processing state where necessary.
4. Classify retries.
5. Design DLQ/replay.
6. Expose lag/failure telemetry.

## Failure modes

Avoid:

- assuming exactly-once without proof; acking before durable effect; unordered assumptions; infinite redelivery loops.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
