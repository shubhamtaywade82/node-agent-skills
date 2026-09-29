---
name: node-consumer-rebalancing
description: Use when consumer groups can rebalance, restart, scale, or lose assignments.
---

# Consumer Group Rebalancing

## Purpose

designing consumers that survive partition/worker reassignment without corrupting work.

## Activate when

- consumer groups can rebalance, restart, scale, or lose assignments.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

assignment ownership is ephemeral; in-flight work must have bounded duration and safe retry; partition order is preserved only within its actual guarantee

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Inspect consumer lifecycle.
2. Handle assignment/revocation.
3. Bound processing with deadlines.
4. Checkpoint/commit at correct point.
5. Make shutdown cooperative.
6. Test duplicate/replayed work.

## Failure modes

Avoid:

- holding assignments indefinitely; committing before side effects; long unbounded handlers; assuming stable partition ownership.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
