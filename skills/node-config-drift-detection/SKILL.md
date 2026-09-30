---
name: node-config-drift-detection
description: Use when multiple environments, deployment systems, secrets, or flags can drift from expected state.
---

# Configuration Drift Detection

## Purpose

detecting differences between intended and effective backend configuration.

## Activate when

- multiple environments, deployment systems, secrets, or flags can drift from expected state.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

configuration has a declared source of truth; drift detection is read-only and safe; secrets are compared by identity/version rather than value

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Identify authoritative configuration.
2. Normalize effective config.
3. Compare safe fingerprints/version IDs.
4. Alert on unexpected drift.
5. Document approved exceptions.

## Failure modes

Avoid:

- logging secret values; comparing only source files; auto-mutating production without approval; environment-specific magic overrides.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
