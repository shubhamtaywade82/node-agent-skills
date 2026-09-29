---
name: node-runtime-health-monitoring
description: Use when operators need evidence of event-loop, memory, file descriptor, worker, or pool health.
---

# Runtime Health Monitoring

## Purpose

monitoring process health beyond basic liveness/readiness probes.

## Activate when

- operators need evidence of event-loop, memory, file descriptor, worker, or pool health.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

- Separate liveness, readiness, and startup health; a dependency outage may make a service unready without making the process dead.
- Health endpoints must be cheap, bounded, and free of secrets or expensive dependency fan-out.
- Dependency checks should reflect the service's actual ability to serve traffic, not simply that a remote system responds.
- Health transitions must be observable and aligned with deployment/supervisor behavior.

## Implementation procedure

1. Identify startup, liveness, and readiness consumers.
2. Define each probe's invariant and timeout budget.
3. Check only dependencies whose failure should change readiness.
4. Expose health transitions as metrics/logs.
5. Test startup, degraded dependency, and recovery states.

## Failure modes

Avoid:

- alerting on single noisy samples; exposing internal diagnostics publicly; using health metrics without ownership/runbooks.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
