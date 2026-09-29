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

- SIGTERM and SIGINT should initiate one controlled shutdown path rather than competing listeners.
- Stop accepting new work before draining in-flight requests and durable workers.
- Shutdown must have a bounded deadline and an explicit exit outcome.
- Signal handling must not swallow fatal errors or leave orphaned child processes.

## Implementation procedure

1. Inventory process signal handlers and owners.
2. Define the shutdown state machine and drain deadline.
3. Stop new work and propagate cancellation.
4. Flush required state and terminate dependents.
5. Test repeated signals, slow work, and forced termination.

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
