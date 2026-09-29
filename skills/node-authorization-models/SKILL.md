---
name: node-authorization-models
description: Use when roles, permissions, resource ownership, tenant roles, ABAC, or policy evaluation are changing.
---

# Authorization Models

## Purpose

designing explicit authorization rules beyond basic authentication.

## Activate when

- roles, permissions, resource ownership, tenant roles, ABAC, or policy evaluation are changing.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

authorization decisions are deny-by-default and resource-aware; authentication establishes identity, not permission; policy inputs are explicit

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Identify actors/resources/actions.
2. Define policy ownership.
3. Centralize reusable decisions.
4. Enforce at every trust boundary.
5. Test allow/deny matrices including cross-tenant access.

## Failure modes

Avoid:

- role names used as permissions everywhere; client-provided role trust; authorization only at UI edge; missing object-level checks.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
