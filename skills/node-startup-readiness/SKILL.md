---
name: node-startup-readiness
description: Use when services require migrations, caches, credentials, connections, or warmup before serving requests.
---

# Startup and Readiness

## Purpose

sequencing application initialization and traffic admission safely.

## Activate when

- services require migrations, caches, credentials, connections, or warmup before serving requests.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

startup is explicit; readiness is withheld until required invariants hold; partial initialization cannot accept traffic

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Define initialization stages.
2. Validate config/secrets.
3. Establish essential clients.
4. Run safe warmups.
5. Set readiness.
6. Handle startup failure.
7. Drain correctly on shutdown.

## Failure modes

Avoid:

- binding/listening before initialization; readiness before dependencies are usable; retrying startup forever with corrupt configuration.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
