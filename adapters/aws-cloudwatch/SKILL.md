---
name: adapter-aws-cloudwatch
description: Use when the repository uses AWS CloudWatch SDK v3.
---

# AWS CloudWatch SDK v3 adapter

## Purpose

Translate framework-neutral Node.js operations and observability guidance into AWS CloudWatch SDK v3-specific mechanics.

## Activate when

- AWS CloudWatch SDK v3 is detected in the target repository.
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

1. Detect AWS CloudWatch SDK v3 and version.
2. Select the framework-neutral owner.
3. Apply AWS CloudWatch SDK v3-specific configuration and lifecycle mechanics.
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

https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_cloudwatch_code_examples.html

## Version scope

AWS SDK JS v3.

## Adapter guidance

Reuse CloudWatch clients; publish bounded custom metrics; never use unbounded dimensions; use alarms tied to operator action; keep region/credentials in runtime configuration.
