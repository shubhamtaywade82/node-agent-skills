---
name: node-memory-leak-diagnostics
description: Use when RSS/heap grows across stable workloads.
---

# Memory Leak Diagnostics

## Purpose

finding retained objects and growth in long-lived Node.js processes.

## Activate when

- RSS/heap grows across stable workloads.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

measure before changing limits; distinguish heap growth, external memory, buffers, native allocations, and legitimate caches

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Capture baseline.
2. Observe heap/RSS over time.
3. Compare snapshots.
4. Identify retaining paths.
5. Reproduce with bounded workload.
6. Verify after fix.

## Failure modes

Avoid:

- raising memory limits as fix; taking snapshots only after OOM; blaming garbage collection without evidence.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
