---
name: node-metric-cardinality-control
description: Use when metrics include request paths, tenant IDs, user IDs, error text, or other runtime values.
---

# Metric Cardinality Control

## Purpose

preventing unbounded metric label/cardinality growth.

## Activate when

- metrics include request paths, tenant IDs, user IDs, error text, or other runtime values.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

labels describe bounded dimensions; IDs and arbitrary strings do not become label values; route templates are preferred to raw URLs

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Inventory labels.\n2. Classify each dimension.\n3. Replace unbounded values with buckets/templates.\n4. Cap series budgets.\n5. Monitor cardinality.\n6. Test representative traffic.

## Failure modes

Avoid:

- tenant_id labels on high-volume metrics; exception messages as labels; raw URL paths as labels.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
