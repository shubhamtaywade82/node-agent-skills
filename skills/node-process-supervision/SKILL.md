---
name: node-process-supervision
description: Use when Node services run under containers, system managers, or process supervisors.
---

# Process Supervision

## Purpose

designing reliable Node.js process lifecycle under crashes, signals, and restarts.

## Activate when

- Node services run under containers, system managers, or process supervisors.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

application handles graceful shutdown but does not become its own unreliable supervisor; exit codes and signal semantics are explicit

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Define startup/shutdown contract.
2. Handle SIGTERM/SIGINT.
3. Stop accepting work.
4. Drain.
5. Set shutdown deadline.
6. Exit nonzero on fatal startup/runtime faults.
7. Delegate restart to platform.

## Failure modes

Avoid:

- restart loops inside application code; swallowing fatal errors; never exiting after shutdown deadline.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
