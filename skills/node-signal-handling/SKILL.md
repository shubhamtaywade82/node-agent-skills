---
name: node-signal-handling
description: Use when deploys, restarts, or operators send SIGTERM/SIGINT/SIGHUP or similar signals.
---

# Node Signal Handling

## Purpose

handling OS signals deterministically in Node.js services and workers.

## Activate when

- deploys, restarts, or operators send SIGTERM/SIGINT/SIGHUP or similar signals.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

signal handlers are minimal and idempotent; shutdown ownership is explicit; process exits after bounded cleanup

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Define supported signals.\n2. Trigger shared shutdown controller.\n3. Stop admission.\n4. Drain resources.\n5. Enforce deadline.\n6. Exit with correct status.\n7. Test repeated signals.

## Failure modes

Avoid:

- doing heavy work in handlers; multiple competing shutdown paths; ignoring hard deadlines.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
