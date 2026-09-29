---
name: node-cloud-events
description: Use when services exchange events across queues, brokers, webhooks, or cloud-event-capable infrastructure.
---

# Cloud Events

## Purpose

transporting cross-service events with an explicit interoperable event envelope.

## Activate when

- services exchange events across queues, brokers, webhooks, or cloud-event-capable infrastructure.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

separate event envelope from domain payload; require stable id/source/type semantics; propagate correlation/trace context; version payloads

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define event identity and source.\n2. Validate required envelope fields.\n3. Serialize deterministically.\n4. Preserve causation/correlation.\n5. Bind to transport.\n6. Design replay/idempotency.

## Failure modes

Avoid:

- using broker topic as the only identity; mutable event IDs; missing content type/version; secrets in events.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
