---
name: node-production-runtime
description: operations
---

# Node Production Runtime

## Purpose
Use when preparing or changing a Node.js service for production startup, readiness, graceful shutdown, containers, or orchestration.

## Activate when
Operate Node.js services with explicit startup, readiness, drain, and shutdown behavior.

## Repository inspection
- Docker/Kubernetes runtime changes.
- Health checks.
- Server or worker lifecycle.

## Decision rules
Inspect image, entrypoint, signals, readiness/liveness checks, dependency initialization, resource cleanup, and deployment termination deadlines.

## Implementation procedure
- Fail fast on invalid static configuration.
- Readiness means the service can serve its workload.
- Shutdown stops new work, drains existing work, closes resources, then exits.
- Shutdown is bounded by the platform deadline.
- Do not depend on a process manager to hide lifecycle defects.

## Failure modes
1. Map startup and shutdown dependencies.
2. Define readiness and liveness.
3. Implement drain state.
4. Close servers, workers, pools, and telemetry in order.
5. Test SIGTERM.

## Verification
- Health endpoints always returning 200.
- Killing before drain.
- Readiness before dependency initialization.
- Shutdown hanging on open handles.
- Secrets baked into images.

## Source foundation
Test startup failure, healthy readiness, dependency failure, SIGTERM drain, and forced-timeout scenarios.
