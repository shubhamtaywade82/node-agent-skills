---
name: node-telemetry-sampling
description: Use when high-throughput services generate more telemetry than the backend or budget can sustain.
---

# Telemetry Sampling

## Purpose

controlling trace/log/metric collection volume while preserving useful diagnostic coverage.

## Activate when

- high-throughput services generate more telemetry than the backend or budget can sustain.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

sampling preserves critical/error signals and is explicit by signal type; sampling does not break trace relationships

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Define sampling policy.\n2. Preserve errors and important operations.\n3. Bound attributes.\n4. Apply consistently at ingress.\n5. Measure dropped telemetry.\n6. Test peak load.

## Failure modes

Avoid:

- randomly dropping all error traces; sampling each library differently without coordination; high-cardinality payloads in sampled events.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
