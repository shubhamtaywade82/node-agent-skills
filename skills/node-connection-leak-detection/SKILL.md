---
name: node-connection-leak-detection
description: Use when pool usage grows unexpectedly or requests fail with connection exhaustion.
---

# Connection Leak Detection

## Purpose

detecting leaked database or network connections before pool exhaustion.

## Activate when

- pool usage grows unexpectedly or requests fail with connection exhaustion.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

every checkout has a deterministic release path; leak detection is evidence-driven and does not mask saturation

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Instrument checkout/release.
2. Inspect long-lived queries.
3. Verify finally/using cleanup.
4. Add timeout/idle protections.
5. Test abort/error paths.
6. Observe pool metrics.

## Failure modes

Avoid:

- closing shared pools per request; increasing pool size to hide leaks; cleanup only on happy path.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
