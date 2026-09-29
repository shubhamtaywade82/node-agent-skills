---
name: node-schema-registry
description: Use when Kafka/streaming/event infrastructure uses a schema registry or centralized schema catalog.
---

# Schema Registry Engineering

## Purpose

managing centrally registered event/message schemas with compatibility controls.

## Activate when

- Kafka/streaming/event infrastructure uses a schema registry or centralized schema catalog.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

schema compatibility is enforced independently from code deployment; schema IDs/versions are immutable; producers and consumers can coexist during migration

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Identify schema owner.
2. Define compatibility mode.
3. Validate generated/runtime serializers.
4. Test previous/current schema pairs.
5. Document rollout and rollback.

## Failure modes

Avoid:

- using schema registry as domain source of truth; breaking consumers silently; embedding mutable schema IDs; skipping consumer compatibility tests.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
