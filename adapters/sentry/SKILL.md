---
name: adapter-sentry
description: Use when the repository uses Sentry JavaScript/Node.
---

# Sentry JavaScript/Node adapter

## Purpose

Translate framework-neutral Node.js operations and observability guidance into Sentry JavaScript/Node-specific mechanics.

## Activate when

- Sentry JavaScript/Node is detected in the target repository.
- The installed tool/SDK version matches the documented scope.

## Repository inspection

1. Inspect workflow/IaC/chart/config files and lockfiles.
2. Confirm the exact installed tool or SDK version.
3. Identify ownership of credentials, state, deployment, telemetry, and rollback.
4. Read neighboring CI/deployment/runbook configuration.

## Decision rules

- Prefer reproducible, version-controlled configuration.
- Keep secrets and high-cardinality data out of committed configuration and telemetry.
- Separate application behavior from delivery infrastructure behavior.
- Verify actual runtime effects rather than trusting configuration syntax alone.

## Implementation procedure

1. Detect Sentry JavaScript/Node and version.
2. Select the framework-neutral owner.
3. Apply Sentry JavaScript/Node-specific configuration and lifecycle mechanics.
4. Add validation or integration checks.
5. Verify rollout, recovery, and observability behavior.

## Failure modes

- Floating versions or mutable deployment inputs.
- Credentials in source/config/state.
- Rollouts without health/rollback criteria.
- Telemetry without redaction or cardinality controls.

## Verification

1. Run adapter/tool validation.
2. Run the full repository suite and build gates.
3. Validate rendered/planned/deployed configuration where applicable.
4. Verify failure and rollback paths.

## Source

https://github.com/getsentry/sentry-javascript

## Version scope

current Sentry JavaScript SDK.

## Adapter guidance

Capture errors with request/job context while redacting secrets and high-sensitivity fields; set release/environment explicitly; configure sampling deliberately; avoid treating Sentry as the only source of telemetry.
