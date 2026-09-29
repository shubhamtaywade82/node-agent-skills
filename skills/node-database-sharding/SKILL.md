---
name: node-database-sharding
description: Use when dataset size, tenant scale, throughput, or isolation requires more than a single database topology.
---

# Database Sharding

## Purpose

partitioning durable relational or document data across database nodes with explicit routing and operational constraints.

## Activate when

- dataset size, tenant scale, throughput, or isolation requires more than a single database topology.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

shard key quality dominates correctness and load distribution; routing must be deterministic; cross-shard operations are explicit and bounded

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Define shard key and ownership.
2. Model routing.
3. Handle resharding.
4. Isolate cross-shard queries.
5. Bound fan-out.
6. Plan migrations.
7. Test hot-key behavior and shard movement.

## Failure modes

Avoid:

- choosing a mutable shard key; cross-shard transactions hidden in repositories; unbounded fan-out; no resharding strategy.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
