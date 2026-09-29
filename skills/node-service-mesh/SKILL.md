---
name: node-service-mesh
description: Use when Kubernetes or platform infrastructure injects service-mesh traffic policies, retries, mTLS, or observability.
---

# Service Mesh Integration

## Purpose

designing Node.js services that operate correctly under sidecar or proxy-managed networking.

## Activate when

- Kubernetes or platform infrastructure injects service-mesh traffic policies, retries, mTLS, or observability.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

application and mesh responsibilities are separated; avoid duplicate retries/timeouts; readiness/draining account for sidecars; identity comes from verified infrastructure signals

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Inspect mesh ownership and traffic policy.
2. Map application deadlines to proxy policies.
3. Verify mTLS/auth assumptions.
4. Test graceful drain.
5. Instrument app and proxy boundaries.

## Failure modes

Avoid:

- stacking retries in both app and mesh; assuming mTLS means authorization; short app timeout beneath proxy timeout; ignoring sidecar shutdown.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
