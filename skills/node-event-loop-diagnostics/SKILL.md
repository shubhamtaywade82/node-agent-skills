---
name: node-event-loop-diagnostics
description: Use when latency spikes, event-loop delay, or CPU saturation affect request handling.
---

# Event Loop Diagnostics

## Purpose

diagnosing event-loop lag and synchronous blocking in Node.js.

## Activate when

- latency spikes, event-loop delay, or CPU saturation affect request handling.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

measure event-loop delay and utilization; identify synchronous CPU/blocking I/O; do not infer from request latency alone

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Instrument event-loop delay/utilization.
2. Profile CPU.
3. Identify blocking stack.
4. Move bounded CPU work to workers or services.
5. Verify under load.

## Failure modes

Avoid:

- adding workers without measuring; treating async syntax as non-blocking; ignoring GC pauses.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
