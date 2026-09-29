---
name: node-feature-flags
description: Use when controlling backend behavior through runtime feature flags, progressive rollouts, kill switches, tenant targeting, or reversible operational controls.
---

# Feature Flags

## Purpose
Make runtime controls explicit, observable, reversible, and temporary.

## Activate when
- Introducing risky backend behavior.
- Rolling a capability out by tenant, region, or percentage.
- Adding an operational kill switch.

## Repository inspection
Inspect flag source, evaluation context, default behavior, consistency model, startup behavior, ownership, audit trail, and cleanup process.

## Decision rules
| Concern | Rule |
|---|---|
| Default | Choose the safe default for flag-store failure and document it. |
| Scope | Evaluate against explicit stable identity. |
| Availability | Do not make every request synchronously depend on an optional flag service. |
| Lifecycle | Every flag needs an owner, purpose, and removal condition. |
| Security | Never use a feature flag as the sole authorization control. |
| Testing | Test enabled, disabled, and store-unavailable states. |

## Implementation procedure
1. Define the behavior controlled by the flag.
2. Choose evaluation context and default.
3. Bound flag-store behavior.
4. Roll out gradually with telemetry.
5. Document rollback/kill-switch criteria.
6. Remove stale flags after rollout completion.

## Failure modes
- Flags become permanent branching debt.
- Missing flag data defaults to unsafe behavior.
- Authorization is implemented as a flag.
- Instances disagree on critical decisions.

## Verification
Test flag states, degraded storage, multi-instance behavior, targeted rollout, and cleanup.