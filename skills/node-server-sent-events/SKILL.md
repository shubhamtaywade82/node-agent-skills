---
name: node-server-sent-events
description: Use when the backend exposes EventSource/SSE endpoints or long-lived streaming HTTP responses.
---

# Server-Sent Events

## Purpose

designing one-way HTTP event streams with explicit lifecycle and replay behavior.

## Activate when

- the backend exposes EventSource/SSE endpoints or long-lived streaming HTTP responses.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

send valid SSE framing; terminate cleanly; heartbeat idle connections when required; support Last-Event-ID/replay only when backed by durable history; bound per-client work

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define event names/data/id/retry semantics.\n2. Authenticate before stream creation.\n3. Register disconnect cleanup.\n4. Heartbeat.\n5. Bound subscriber queues.\n6. Choose replay storage.\n7. Instrument active connections.

## Failure modes

Avoid:

- unbounded per-client queues; replay without durable cursor; writing after disconnect; treating SSE as a job queue; missing proxy timeouts.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
