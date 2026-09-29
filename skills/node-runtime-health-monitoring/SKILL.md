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

health signals are actionable, bounded, and tied to service capacity/SLOs; monitoring avoids sensitive data exposure

- Correctness and operational safety take precedence over convenience.
- Optimize from measured workload evidence.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure

1. Define health indicators.\n2. Set thresholds from baselines.\n3. Expose metrics/diagnostics.\n4. Alert on sustained degradation.\n5. Correlate resource health with requests.\n6. Test threshold behavior.

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
