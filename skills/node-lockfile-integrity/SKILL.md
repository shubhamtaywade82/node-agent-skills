---
name: node-lockfile-integrity
description: Use when dependencies or CI installs produce different trees.
---

# Lockfile Integrity

## Purpose

maintaining reproducible dependency graphs and detecting lockfile drift.

## Activate when

- dependencies or CI installs produce different trees.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

lockfile is part of the supply-chain contract; package manager and lockfile versions must agree; frozen installs are preferred in CI

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Identify package manager.
2. Validate lockfile.
3. Use frozen/immutable install in CI.
4. Review dependency graph changes.
5. Verify integrity metadata.
6. Test clean install.

## Failure modes

Avoid:

- editing lockfile manually; mixed package managers; accepting install-time lockfile mutation in CI.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
