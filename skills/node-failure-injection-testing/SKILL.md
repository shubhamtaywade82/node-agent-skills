---
name: node-failure-injection-testing
description: Use when resilience behavior needs automated verification rather than only manual chaos experiments.
---

# Failure Injection Testing

## Purpose

testing explicit timeout, dependency failure, process, storage, and network failure paths deterministically.

## Activate when

- resilience behavior needs automated verification rather than only manual chaos experiments.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

faults are scoped to one failure mode; injection is deterministic and reversible; assertions target recovery/degradation semantics

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Identify fault boundary.
2. Inject controlled error/latency/disconnect.
3. Assert timeout/retry/fallback.
4. Verify cleanup and telemetry.
5. Remove fault.
6. Keep test fast and repeatable.

## Failure modes

Avoid:

- random faults in unit tests; injected failure without cleanup; asserting only that an exception was thrown.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
