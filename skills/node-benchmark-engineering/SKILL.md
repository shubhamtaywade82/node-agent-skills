---
name: node-benchmark-engineering
description: Use when a change affects throughput, latency, CPU, memory, serialization, database, or hot-path performance.
---

# Benchmark Engineering

## Purpose

measuring backend performance with statistically useful, reproducible benchmarks.

## Activate when

- a change affects throughput, latency, CPU, memory, serialization, database, or hot-path performance.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

benchmark workload represents production pressure; warmup and variance are handled; baseline comparisons are explicit; benchmark results are evidence, not goals

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Define representative workload.
2. Control environment.
3. Warm up.
4. Run enough iterations.
5. Report distribution.
6. Compare baseline/target.
7. Inspect CPU/memory.
8. Reject regressions based on agreed threshold.

## Failure modes

Avoid:

- single timing sample; synthetic workload unlike production; optimizing benchmark-only code; ignoring variance.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
