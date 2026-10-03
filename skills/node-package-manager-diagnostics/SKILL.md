---
name: node-package-manager-diagnostics
description: Use when dependency installation or package scripts behave differently across environments.
---

# Package Manager Diagnostics

## Purpose

diagnosing npm/pnpm/yarn installation, scripts, workspace, and lifecycle failures.

## Activate when

- dependency installation or package scripts behave differently across environments.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

use repository-declared package manager/version; distinguish install, resolution, lifecycle, and script failures

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Inspect packageManager/engines.
2. Run native diagnostic commands.
3. Inspect workspace boundaries.
4. Reproduce cleanly.
5. Compare environment.
6. Fix root cause.

## Failure modes

Avoid:

- switching package managers casually; deleting lockfiles; disabling lifecycle scripts without impact analysis.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
