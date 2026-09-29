---
name: node-telemetry-sampling
description: Use when high-cardinality or high-volume telemetry creates cost and noise.
---

# Telemetry Sampling

## Purpose

controlling trace/log/metric volume while preserving useful diagnostic coverage.

## Activate when

- high-cardinality or high-volume telemetry creates cost and noise.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

sampling policy is explicit by environment and signal; errors and rare critical paths receive stronger retention

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Define sampling dimensions.
2. Preserve errors/slow requests.
3. Configure head/tail strategy as supported.
4. Measure drop rate.
5. Test policy changes.

## Failure modes

Avoid:

- randomly dropping all errors; sampling metrics as if traces; hidden vendor defaults.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
