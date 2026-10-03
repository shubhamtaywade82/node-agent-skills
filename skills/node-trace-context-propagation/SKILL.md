---
name: node-trace-context-propagation
description: Use when a request crosses services or messaging systems and needs one trace lineage.
---

# Trace Context Propagation

## Purpose

preserving distributed trace context across HTTP, queues, and asynchronous boundaries.

## Activate when

- a request crosses services or messaging systems and needs one trace lineage.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

propagate standardized trace context only at trusted protocol boundaries; do not trust trace IDs for authorization

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Extract context at ingress.\n2. Validate protocol format.\n3. Create child spans.\n4. Inject on outbound calls/messages.\n5. Correlate async jobs.\n6. Test missing/malformed context.

## Failure modes

Avoid:

- using trace IDs as security identity; copying arbitrary inbound headers into downstream requests; losing context on background jobs.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
