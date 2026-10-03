---
name: node-module-resolution-diagnostics
description: Use when imports fail only in certain environments, package entrypoints differ, or runtime cannot resolve a dependency.
---

# Module Resolution Diagnostics

## Purpose

debugging ESM/CommonJS/package exports resolution failures.

## Activate when

- imports fail only in certain environments, package entrypoints differ, or runtime cannot resolve a dependency.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

inspect actual Node resolution rules, package exports/imports, conditions, symlinks, and installed tree; do not guess from TypeScript paths

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Reproduce with Node directly.
2. Inspect package.json exports.
3. Compare lockfile and node_modules.
4. Trace resolution where supported.
5. Fix authoritative package/config source.
6. Test ESM and production packaging.

## Failure modes

Avoid:

- changing tsconfig paths to hide runtime resolution errors; assuming TypeScript resolution equals Node resolution.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
