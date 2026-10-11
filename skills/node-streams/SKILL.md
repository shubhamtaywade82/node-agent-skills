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

## Implementation procedure

1. Identify source/sink rates.
2. Choose readable/writable/transform boundaries.
3. Set bounded buffering deliberately.
4. Compose with pipeline.
5. Wire abort/error cleanup.
6. Test slow consumers and partial failure.

## Failure modes

Avoid:

- read-all-into-memory; ignoring write backpressure; manual pipe chains with missing cleanup; double-ending streams.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
