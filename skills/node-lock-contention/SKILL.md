---
name: node-lock-contention
description: Use when concurrent transactions compete for the same rows or tables.
---

# Database Lock Contention

## Purpose

diagnosing and reducing lock waits, deadlocks, and serialization hotspots.

## Activate when

- concurrent transactions compete for the same rows or tables.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

lock scope/order/duration are explicit; contention is measured; retries are bounded and safe

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Identify lock source.
2. Inspect wait graphs/logs.
3. Shorten transactions.
4. Align lock ordering.
5. Choose isolation/locking strategy.
6. Add bounded retry for retryable conflicts.
7. Test concurrency.

## Failure modes

Avoid:

- sleep-and-retry loops; holding locks across network calls; inconsistent lock order; retrying non-idempotent work.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
