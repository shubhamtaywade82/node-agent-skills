---
name: node-rpc-contracts
description: Use when multiple services need typed request/response contracts, versioning, or cross-language compatibility.
---

# RPC Contract Engineering

## Purpose

designing durable RPC contracts independent of one transport.

## Activate when

- multiple services need typed request/response contracts, versioning, or cross-language compatibility.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

stable field identity matters; additive evolution is preferred; absence/default semantics are explicit; transport errors are separate from domain errors

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Identify producer/consumer ownership.
2. Define fields and optionality.
3. Document compatibility.
4. Generate or validate types.
5. Test old/new payload interoperability.
6. Define error mapping.

## Failure modes

Avoid:

- renumbering fields; reusing removed fields; coupling domain models directly to wire payloads; assuming TypeScript types enforce runtime compatibility.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
