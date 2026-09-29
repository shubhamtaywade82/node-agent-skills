---
name: node-api-gateway
description: Use when a service aggregates or proxies multiple downstream APIs.
---

# API Gateway Engineering

## Purpose

placing a backend gateway at a clear trust, routing, and policy boundary.

## Activate when

- a service aggregates or proxies multiple downstream APIs.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

gateway duties are explicit; auth/policy happens before proxying where appropriate; deadlines and request budgets propagate; retries respect downstream idempotency; hop-by-hop headers are controlled

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Define gateway ownership.
2. Map routes.
3. Enforce auth/rate limits.
4. Propagate correlation/deadlines.
5. Bound fan-out and payload size.
6. Normalize errors.
7. Instrument upstream/downstream latency.

## Failure modes

Avoid:

- blind pass-through; unlimited fan-out; double retries; trusting downstream auth without boundary checks; leaking internal headers/errors.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
