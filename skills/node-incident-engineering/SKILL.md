---
name: node-incident-engineering
description: Use when diagnosing or responding to Node.js production incidents involving errors, latency, saturation, dependency failures, data inconsistency, or unsafe operational changes.
---

# Incident Engineering

## Purpose
Incident response is controlled evidence gathering and risk reduction, not uncontrolled code changes.

## Activate when
- Production metrics breach an SLO or availability target.
- Errors, latency, resource saturation, or data anomalies are spreading.
- An operator needs to mitigate a live failure safely.

## Repository inspection
Identify observability sources, deploy history, dependency health, feature flags, recent migrations, error budgets, and known runbooks.

## Decision rules
| Concern | Rule |
|---|---|
| Evidence | Establish timeline and measurable symptoms before choosing a root cause. |
| Mitigation | Prefer reversible, low-blast-radius actions first. |
| Scope | Identify affected capability, tenants, regions, and versions. |
| Change control | Do not bundle speculative refactors into an incident mitigation. |
| Recovery | Verify service/data health after mitigation, not only process health. |
| Learning | Record causal evidence, contributing factors, and concrete prevention work. |

## Implementation procedure
1. Establish incident start, symptoms, and current blast radius.
2. Preserve relevant logs, metrics, traces, deploys, and database events.
3. Form and test hypotheses against evidence.
4. Apply the smallest reversible mitigation.
5. Validate recovery and continue monitoring.
6. Document timeline, root/contributing causes, and follow-up actions.

## Failure modes
- Restarting everything destroys evidence and increases blast radius.
- Rollback is used despite an incompatible migration.
- A single noisy metric is treated as root cause.
- Incident fixes introduce unrelated code changes.
- Closure is declared when only the process recovered, not the user capability.

## Verification
Incident runbooks should be executable from observable signals and include rollback/repair criteria, escalation paths, and post-incident evidence capture.
