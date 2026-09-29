---
name: node-test-isolation-engineering
description: Use when tests intermittently influence each other or CI parallelism exposes shared state.
---

# Test Isolation Engineering

## Purpose

keeping parallel backend tests independent in state, ports, clocks, databases, queues, and process resources.

## Activate when

- tests intermittently influence each other or CI parallelism exposes shared state.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

isolation is explicit and cheap; unique resource identity beats global cleanup; test time is controlled; external state is disposable

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Identify shared resources.
2. Assign unique namespaces/ports.
3. Isolate database rows/queues/files.
4. Reset clocks/mocks.
5. Tear down every resource.
6. Run tests concurrently to prove isolation.

## Failure modes

Avoid:

- global singleton state; order-dependent tests; fixed ports; shared tenant/database fixtures; cleanup only on success.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
