---
name: node-worker-crash-recovery
description: Use when a service uses worker threads or child execution for isolated jobs.
---

# Worker Crash Recovery

## Purpose

recovering from worker-thread or background execution failures without losing ownership or corrupting shared state.

## Activate when

- a service uses worker threads or child execution for isolated jobs.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

worker failure is treated as loss of execution state; jobs are retryable only when their contract permits; pool capacity stays bounded

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Define worker job protocol.\n2. Detect exit/error.\n3. Mark in-flight work.\n4. Replace workers with backoff.\n5. Prevent duplicate completion.\n6. Propagate cancellation.\n7. Test crash during job.

## Failure modes

Avoid:

- retrying a non-idempotent job blindly; unbounded worker replacement; losing job ownership metadata.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
