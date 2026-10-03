---
name: node-process-supervision
description: Use when the service depends on process managers, containers, systemd, Kubernetes, or platform supervisors.
---

# Process Supervision

## Purpose

keeping critical Node.js processes supervised and restartable in production.

## Activate when

- the service depends on process managers, containers, systemd, Kubernetes, or platform supervisors.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

application code should exit with meaningful status on fatal corruption; supervisors own restart policy; graceful shutdown is bounded

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Define fatal vs recoverable faults.\n2. Wire SIGTERM/SIGINT shutdown.\n3. Drain work.\n4. Set hard shutdown deadline.\n5. Expose startup/readiness.\n6. Configure supervisor restart policy.\n7. Test repeated crashes.

## Failure modes

Avoid:

- internal restart loops; swallowing uncaught exceptions; hanging shutdown; assuming PID 1 behavior without verification.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
