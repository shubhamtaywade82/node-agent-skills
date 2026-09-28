---
name: node-production-runtime
description: Use when preparing or changing a Node.js service for production startup, readiness, graceful shutdown, containers, or orchestration.
---

# Node Production Runtime

## Purpose
Operate Node.js services with explicit startup, readiness, drain, and shutdown behavior.

## Activate when
Change Docker/Kubernetes runtime, health checks, server lifecycle, or worker lifecycle.

## Repository inspection
Inspect image, entrypoint, signals, readiness/liveness checks, dependency initialization, cleanup, and termination deadlines.

## Decision rules
Fail fast on invalid static config. Readiness means the service can serve its workload. Shutdown stops new work, drains existing work, closes resources, then exits within the platform deadline.

## Implementation procedure
1. Map lifecycle dependencies. 2. Define readiness/liveness. 3. Implement drain. 4. Close servers/workers/pools/telemetry in order. 5. Test SIGTERM.

## Failure modes
Health endpoints always 200; killing before drain; readiness before dependencies; shutdown hanging; secrets baked into images.

## Verification
Test startup failure, healthy readiness, dependency failure, SIGTERM drain, and forced-timeout scenarios.

## Source foundation
https://nodejs.org/api/process.html
