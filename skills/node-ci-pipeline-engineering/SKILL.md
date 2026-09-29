---
name: node-ci-pipeline-engineering
description: Use when build, lint, test, security, or packaging gates run in CI.
---

# CI Pipeline Engineering

## Purpose

designing reliable CI pipelines for Node.js/TypeScript repositories.

## Activate when

- build, lint, test, security, or packaging gates run in CI.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

CI is reproducible, fast enough, deterministic, and security-aware; dependency installation is locked; failures expose actionable evidence

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Map local vs CI commands.
2. Pin runtime/tool versions.
3. Use lockfile-enforcing installs.
4. Separate fast checks from expensive checks.
5. Cache only safe inputs.
6. Upload useful artifacts.

## Failure modes

Avoid:

- floating runtimes; mutable install state; hidden network dependencies; unsafe cache keys; CI diverging from local commands.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
