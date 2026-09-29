---
name: adapter-datadog
description: Use when the repository uses Datadog Node.js tracer.
---

# Datadog Node.js tracer adapter

## Purpose

Translate framework-neutral Node.js operations and observability guidance into Datadog Node.js tracer-specific mechanics.

## Activate when

- Datadog Node.js tracer is detected in the target repository.
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

1. Detect Datadog Node.js tracer and version.
2. Select the framework-neutral owner.
3. Apply Datadog Node.js tracer-specific configuration and lifecycle mechanics.
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

https://docs.datadoghq.com/tracing/trace_collection/dd_libraries/nodejs/

## Version scope

current dd-trace.

## Adapter guidance

Initialize tracing before application imports when required; propagate trace context; keep service/env/version identifiers stable; control sampling and sensitive payload capture; verify instrumentation after upgrades.
