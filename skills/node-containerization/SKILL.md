---
name: node-containerization
description: Use when packaging Node.js applications into container images, optimizing image size, running as non-root, handling signals, or making container startup and shutdown production-safe.
---

# Containerization

## Purpose
Produce small, deterministic Node.js images that respect process, filesystem, network, and lifecycle contracts.

## Activate when
- Adding or changing Dockerfiles or compose-based development.
- Moving from local execution to containers.
- Hardening production images.

## Repository inspection
Inspect Node version, package manager, lockfile, build output, native dependencies, health checks, runtime user, filesystem writes, signal handling, and image publishing.

## Decision rules
| Concern | Rule |
|---|---|
| Build | Separate build-only dependencies/artifacts from the runtime image where practical. |
| Reproducibility | Build from the authoritative lockfile and declared base-image policy. |
| User | Run as non-root unless a documented capability requires otherwise. |
| Filesystem | Treat the image filesystem as disposable; externalize durable state. |
| Signals | Ensure Node receives termination signals through the chosen process model. |
| Health | Health checks should represent useful state and remain cheap. |

## Implementation procedure
1. Use the repository's real package-manager workflow.
2. Compile once and copy required runtime artifacts.
3. Minimize writable surfaces and privileges.
4. Configure environment and health behavior.
5. Test startup and graceful termination.
6. Scan/publish the exact tested image artifact.

## Failure modes
- Dev dependencies and source unnecessarily ship to production.
- PID 1/signal handling causes forced termination.
- Native modules are built for the wrong platform.
- Health checks restart healthy-but-warming processes.

## Verification
Build and run a clean image, exercise health and termination behavior, and identify the exact tested artifact.