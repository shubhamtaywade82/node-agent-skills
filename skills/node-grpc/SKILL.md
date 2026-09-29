---
name: node-grpc
description: Use when a backend exposes or consumes gRPC/RPC methods.
---

# gRPC Services

## Purpose

building or changing gRPC services and clients with explicit contracts, deadlines, and lifecycle.

## Activate when

- a backend exposes or consumes gRPC/RPC methods.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

proto definitions are contracts; deadlines/cancellation propagate; status codes are intentional; metadata is untrusted; streaming has bounded flow control; reflection/codegen choices are explicit

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Inspect .proto ownership and generated artifacts.
2. Define RPC contract and compatibility rules.
3. Wire server/client lifecycle.
4. Propagate deadlines and aborts.
5. Validate authorization and request data.
6. Test unary/streaming failure paths.

## Failure modes

Avoid:

- using arbitrary JavaScript objects as contracts; missing deadlines; treating stream writes as unbounded; editing generated files; leaking internal errors.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
