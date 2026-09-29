---
name: Docker adapter
description: Use when a target Node.js repository builds and runs with Docker and the agent needs Docker-specific image, build, health, or signal guidance.
---

# Docker Adapter

## Purpose
Map containerization principles onto the repository's Dockerfile, build context, image, and runtime conventions.

## Activate when
- Dockerfiles or compose files are present.
- CI publishes container images.

## Repository inspection
Inspect Dockerfile stages, .dockerignore, base-image policy, package-manager files, build command, runtime user, ports, health checks, and image publishing.

## Decision rules
- Detect and follow the repository's supported Node base-image policy.
- Keep build-only dependencies out of runtime images where practical.
- Run the service with an explicit non-root user.
- Ensure Node receives SIGTERM through the chosen process model.
- Verify the final image, not only Dockerfile syntax.

## Implementation procedure
1. Detect the existing image/build strategy.
2. Optimize only after correctness and reproducibility.
3. Verify native dependencies for target architecture.
4. Test health and graceful termination.
5. Scan and promote the exact image digest that passed CI.

## Failure modes
- Multi-stage builds copy incomplete native artifacts.
- The final image lacks legitimate temporary-write support.
- Mutable tags are treated as immutable artifact identity.

## Verification
Build, run, health-check, terminate, inspect, and identify the tested image.