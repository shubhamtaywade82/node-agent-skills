---
name: node-threat-modeling
description: Use when new attack surface, data flow, privilege boundary, integration, or infrastructure trust is introduced.
---

# Backend Threat Modeling

## Purpose

systematically identifying abuse paths before implementing security-sensitive backend changes.

## Activate when

- new attack surface, data flow, privilege boundary, integration, or infrastructure trust is introduced.
- The change crosses a backend trust, contract, or lifecycle boundary.
- Existing behavior must remain compatible unless explicitly changed.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, build scripts, CI, and test framework.
2. Inspect the current implementation owner, dependency graph, configuration, and generated artifacts.
3. Identify the existing runtime contract and neighboring tests.
4. Detect exact integration/library versions before using adapter-specific APIs.

## Decision rules

model assets, actors, trust boundaries, entry points, abuse cases, and mitigations; prioritize by likelihood/impact without turning the model into a generic checklist

- Framework-neutral core guidance owns behavior; adapters only translate concrete library mechanics.
- Runtime validation is required for untrusted data even when TypeScript types exist.
- Failure handling must have bounded time/resource budgets and observable outcomes.
- Prefer the smallest design that makes ownership and compatibility explicit.

## Implementation procedure

1. Map data flows.
2. Mark trust boundaries.
3. Enumerate abuse cases.
4. Select mitigations.
5. Assign residual risk.
6. Add tests/telemetry for high-value controls.

## Failure modes

Avoid:

- listing generic CVEs; ignoring internal actors; threat model detached from implementation; no verification of mitigations.
- Hidden coupling, unbounded retries/work, or silent fallback that changes semantics.
- Tests that validate implementation details instead of externally observable behavior.

## Verification

1. Write or update focused tests before behavior changes.
2. Exercise failure, cancellation, compatibility, and cleanup paths relevant to the boundary.
3. Run focused tests and then the full repository test suite.
4. Run typecheck/build/lint/deployment validation gates defined by the target repository.
5. Record assumptions, residual risks, and rollback implications.
