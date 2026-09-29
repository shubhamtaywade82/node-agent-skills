---
name: node-runtime-feature-detection
description: Use when a library or service supports different Node versions or optional platform features.
---

# Runtime Feature Detection

## Purpose

supporting multiple Node.js runtime capabilities without brittle version checks.

## Activate when

- a library or service supports different Node versions or optional platform features.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

prefer capability detection where possible; version gates remain explicit for documented behavioral differences

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Identify required capability.
2. Detect API availability safely.
3. Provide fallback.
4. Document minimum version.
5. Test supported runtimes.

## Failure modes

Avoid:

- checking version strings for every feature; silent fallback that changes correctness.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
