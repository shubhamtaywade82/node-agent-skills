---
name: node-health-check-engineering
description: Use when a service exposes health endpoints or Kubernetes/cloud health probes.
---

# Health Check Engineering

## Purpose

designing liveness, readiness, startup, and dependency health endpoints with correct semantics.

## Activate when

- a service exposes health endpoints or Kubernetes/cloud health probes.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

liveness answers whether restart may help; readiness answers whether traffic is safe; startup protects slow initialization; dependency checks avoid cascading failure

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Define each probe.
2. Keep liveness cheap.
3. Bound readiness dependencies.
4. Return stable status schema.
5. Avoid database checks in liveness.
6. Instrument probe latency.
7. Test degraded states.

## Failure modes

Avoid:

- one endpoint used for every purpose; liveness depends on fragile downstream services; probe storms; exposing sensitive diagnostics.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
