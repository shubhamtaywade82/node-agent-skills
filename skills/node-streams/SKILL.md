---
name: node-streams
description: Use when processing files, HTTP bodies, large datasets, or slow producers/consumers.
---

# Node.js Streams

## Purpose

using Node streams for bounded-memory data processing and reliable I/O.

## Activate when

- processing files, HTTP bodies, large datasets, or slow producers/consumers.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

prefer pipeline-based composition; respect backpressure; propagate errors; close resources; use AbortSignal where supported; do not buffer unbounded data

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Identify source/sink rates.\n2. Choose readable/writable/transform boundaries.\n3. Set bounded buffering deliberately.\n4. Compose with pipeline.\n5. Wire abort/error cleanup.\n6. Test slow consumers and partial failure.

## Failure modes

Avoid:

- read-all-into-memory; ignoring write backpressure; manual pipe chains with missing cleanup; double-ending streams.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
