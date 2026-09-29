---
name: node-runbook-engineering
description: Use when operators need steps for incidents, migrations, recovery, scaling, or maintenance.
---

# Runbook Engineering

## Purpose

writing executable backend operational runbooks for recurring failures and changes.

## Activate when

- operators need steps for incidents, migrations, recovery, scaling, or maintenance.
- The change crosses an operational, browser-security, delivery, or infrastructure boundary.

## Repository inspection

1. Detect runtime, deployment, HTTP stack, identity model, CI system, and infrastructure configuration.
2. Inspect existing security controls, environment differences, operational docs, and tests.
3. Identify the owning boundary for the new behavior.

## Decision rules

runbooks are symptom-oriented, command-oriented, and scoped; include prerequisites, safety checks, escalation, verification, and rollback

- Security settings must be environment-aware and fail safe.
- Operational controls need explicit observability and verification.
- Do not infer tool behavior from memory; detect versions/configuration in the repository.

## Implementation procedure

1. Define trigger/symptoms.
2. Gather prerequisites.
3. Provide bounded commands.
4. Add safety/abort checks.
5. Define verification.
6. Link metrics/logs.
7. Document escalation and rollback.

## Failure modes

Avoid:

- tutorial prose without decision points; destructive commands without safety checks; missing expected output; stale command/version assumptions.
- Hidden environment assumptions, unbounded permissions, or unverified operator steps.
- Tests that check only configuration text instead of actual behavior.

## Verification

1. Add focused tests before behavior changes.
2. Exercise negative/security/failure paths.
3. Run the full repository gate.
4. Validate deployment and operational artifacts where applicable.
5. Record remaining risk and recovery/rollback actions.
