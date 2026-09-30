---
name: node-query-performance
description: Use when latency or resource usage indicates query inefficiency.
---

# Database Query Performance

## Purpose

diagnosing and improving slow database queries without changing correctness.

## Activate when

- latency or resource usage indicates query inefficiency.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

optimize based on measured query plans, cardinality, and actual workload; avoid hiding N+1 or overfetching with arbitrary caching

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Capture slow query.
2. Inspect execution plan.
3. Verify statistics/indexes.
4. Reduce rows/columns.
5. Batch or paginate.
6. Benchmark.
7. Recheck under representative load.

## Failure modes

Avoid:

- optimizing from ORM source alone; missing indexes; selecting huge payloads; replacing a query with a less consistent cache.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
