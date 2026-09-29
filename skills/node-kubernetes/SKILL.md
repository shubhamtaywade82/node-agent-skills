---
name: node-kubernetes
description: Use when deploying Node.js services on Kubernetes, including probes, resource requests and limits, rolling updates, termination, autoscaling, jobs, and workload availability.
---

# Kubernetes Operations

## Purpose
Align Node.js process lifecycle and capacity behavior with Kubernetes scheduling and rollout semantics.

## Activate when
- Adding Deployments, Jobs, Services, probes, or autoscaling.
- Tuning resources or rollout behavior.
- Debugging pods that restart or fail to drain.

## Repository inspection
Inspect workload manifests, probes, resources, termination grace periods, readiness gates, disruption budgets, autoscaling, routing, and app SIGTERM handling.

## Decision rules
| Concern | Rule |
|---|---|
| Readiness | Remove a pod from traffic before terminating it. |
| Liveness | Use liveness for unrecoverable local failure, not ordinary dependency degradation. |
| Resources | Set requests/limits from measured workload and Node.js memory behavior. |
| Shutdown | Align app drain deadlines with Kubernetes termination deadlines. |
| Rollout | Old and new replicas must tolerate mixed versions. |
| Autoscaling | Scale on the resource that actually constrains capacity. |

## Implementation procedure
1. Map pod lifecycle to application lifecycle.
2. Set probe and resource contracts.
3. Verify rollout and disruption policy.
4. Exercise termination, rolling update, and scale scenarios.
5. Correlate cluster events with application telemetry.

## Failure modes
- Liveness restarts pods because a dependency is unavailable.
- Graceful shutdown exceeds the pod grace period.
- CPU-only autoscaling misses event-loop, memory, or queue pressure.
- Rollout assumes a schema unavailable to old replicas.

## Verification
Test probes, SIGTERM drain, rolling updates, resource pressure, autoscaling, and disruption.