---
name: node-heap-diagnostics
description: Use when heap usage or allocation patterns require detailed investigation.
---

# Heap Diagnostics

## Purpose

using Node heap snapshots and profiling safely to diagnose memory pressure.

## Activate when

- heap usage or allocation patterns require detailed investigation.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

heap snapshots can be large and sensitive; production capture must be controlled and protected

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Define capture trigger.
2. Capture safely.
3. Analyze dominators/retainers.
4. Correlate with request/job lifecycle.
5. Remove artifacts after analysis.
6. Validate memory recovery.

## Failure modes

Avoid:

- exposing snapshots publicly; capturing continuously; interpreting retained size without workload context.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
