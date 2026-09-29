---
name: node-database-index-engineering
description: Use when a backend query is slow or schema changes require new indexes.
---

# Database Index Engineering

## Purpose

designing indexes from actual query predicates, ordering, selectivity, and write cost.

## Activate when

- a backend query is slow or schema changes require new indexes.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

indexes support concrete access paths; every index adds write/storage cost; production rollout considers lock/build characteristics

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Capture real query shapes.
2. Inspect plans.
3. Choose composite/order/partial indexes.
4. Estimate selectivity.
5. Test reads and writes.
6. Plan online rollout.
7. Verify after deployment.

## Failure modes

Avoid:

- adding indexes by column name alone; redundant overlapping indexes; indexing low-selectivity fields without evidence; ignoring write amplification.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
