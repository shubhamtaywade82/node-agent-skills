---
name: node-transaction-retry
description: Use when deadlocks, serialization failures, or transient connection faults can abort a transaction.
---

# Transaction Retry

## Purpose

retrying transient database transaction failures without duplicating unsafe side effects.

## Activate when

- deadlocks, serialization failures, or transient connection faults can abort a transaction.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

retry only classified transient failures; entire transaction body reruns; external side effects remain outside or are made idempotent

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Classify retryable errors.
2. Bound attempts/time.
3. Add jitter where needed.
4. Rerun complete transaction.
5. Ensure deterministic inputs.
6. Test deadlock/serialization cases.

## Failure modes

Avoid:

- retrying every database error; retrying after irreversible external side effects; nested retry amplification.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
