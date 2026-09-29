---
name: Kubernetes adapter
description: Use when a target Node.js backend is deployed to Kubernetes and the agent must reason about probes, rollout, termination, resources, or workload lifecycle.
---

# Kubernetes Adapter

## Purpose
Translate Node.js readiness, shutdown, and capacity contracts into Kubernetes semantics.

## Activate when
- Kubernetes manifests, Helm charts, or Kustomize are present.
- Deployments, Jobs, probes, or autoscaling change.

## Repository inspection
Inspect workload manifests, Services, probes, resource requests/limits, terminationGracePeriodSeconds, rollout strategy, disruption budgets, autoscaler signals, and application signal handling.

## Decision rules
- Readiness decides whether traffic should be routed; liveness is not a dependency-health proxy.
- Align application drain deadlines with Kubernetes termination deadlines.
- Keep rolling updates compatible with mixed application/schema versions.
- Size resources from measured Node.js behavior.
- Verify autoscaling signals represent the constrained resource.

## Implementation procedure
1. Map pod lifecycle to application lifecycle.
2. Set probe and resource contracts.
3. Verify rollout and disruption policy.
4. Exercise termination, rolling update, and scaling.
5. Correlate Kubernetes events with application telemetry.

## Failure modes
- Probes cause restart loops during dependency degradation.
- Graceful shutdown exceeds the pod grace period.
- Resource limits are copied from another service without workload evidence.

## Verification
Test probes, rollouts, drains, disruption, scaling, and failure recovery.