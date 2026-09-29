---
name: node-release-engineering
description: Use when designing or executing Node.js backend releases, staged rollouts, artifact promotion, rollback, feature flags, or compatibility-sensitive deployment pipelines.
---

# Release Engineering

## Purpose
A release changes code, configuration, schemas, and runtime behavior together. Make promotion and recovery deterministic and observable.

## Activate when
- Changing production deployment pipelines.
- Coordinating application and database releases.
- Introducing canary, rolling, blue/green, feature-flagged, or staged release strategies.

## Repository inspection
Inspect build artifacts, lockfiles, image digests, migration pipeline, health checks, deployment strategy, feature flags, rollback process, and release approvals.

## Decision rules
| Concern | Rule |
|---|---|
| Artifact | Build once and promote the same immutable artifact across environments. |
| Compatibility | Verify old/new binaries and schema can coexist when rolling updates require it. |
| Migration | Run compatibility-preserving migrations before application assumptions that depend on them. |
| Rollback | Define whether rollback is safe; otherwise use roll-forward/repair explicitly. |
| Promotion | Use measurable gates: error rate, latency, saturation, business signals where applicable. |
| Config | Treat configuration changes as release inputs and validate them before rollout. |
| Supply chain | Pin dependencies/build inputs sufficiently to reproduce the artifact. |

## Implementation procedure
1. Produce an immutable versioned artifact.
2. Validate tests, migrations, and deployment manifests.
3. Roll out to a controlled slice.
4. Compare health signals with the baseline.
5. Promote only when gates hold.
6. Execute rollback or roll-forward criteria when signals regress.

## Failure modes
- Production artifact differs from the tested artifact.
- Rollback deploys code incompatible with already-applied schema changes.
- Canary checks only liveness and misses user-visible failures.
- Manual config drift makes releases irreproducible.
- Automatic rollback oscillates because health thresholds lack hysteresis.

## Verification
Test release artifact reproducibility, migration sequencing, staged traffic, rollback/roll-forward paths, health gates, and deployment interruption.
