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

## Implementation procedure

1. Define event identity and source.
2. Validate required envelope fields.
3. Serialize deterministically.
4. Preserve causation/correlation.
5. Bind to transport.
6. Design replay/idempotency.

## Failure modes

Avoid:

- using broker topic as the only identity; mutable event IDs; missing content type/version; secrets in events.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
