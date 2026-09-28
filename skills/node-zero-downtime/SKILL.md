---
name: node-zero-downtime
description: Use when deploying or restarting Node.js services without interrupting active traffic, including readiness, draining, graceful shutdown, rolling updates, and mixed-version compatibility.
---

# Zero-Downtime Operations

## Purpose
A deploy is safe only when old and new processes can coexist and active work has a bounded drain path.

## Activate when
- Deploying Node.js services behind a load balancer or Kubernetes.
- Changing startup/readiness/shutdown behavior.
- Rolling out a schema or API change.

## Repository inspection
Inspect health endpoints, readiness conditions, SIGTERM handling, server.close behavior, worker shutdown, load balancer deregistration, pod termination settings, and migration sequencing.

## Decision rules
| Concern | Rule |
|---|---|
| Readiness | Report ready only when the process can serve its intended capability. |
| Drain | Remove from traffic before terminating active work. |
| Shutdown | Stop new work, finish/recover bounded in-flight work, close dependencies, then exit before the termination deadline. |
| Compatibility | New binaries must tolerate old schema/contracts during rollout. |
| Health | Liveness should not fail merely because a recoverable dependency is temporarily degraded. |
| Workers | Queue consumers need explicit pause/drain/reclaim behavior. |

## Implementation procedure
1. Define startup states and readiness dependencies.
2. Register signal handling once.
3. Stop accepting new work on shutdown.
4. Wait for bounded in-flight work.
5. Close HTTP servers, workers, pools, and telemetry exporters.
6. Force termination or surface failure after the deployment deadline.

## Failure modes
- Process receives SIGTERM but immediately exits, dropping active work.
- Readiness stays true while shutdown is draining.
- Liveness depends on a flaky external dependency.
- New code requires a column not yet available to old replicas.

## Verification
Test rolling deploys, long-running requests, active transactions, queue workers, dependency shutdown failures, and termination deadlines.
