---
name: node-event-loop-diagnostics
description: Use when latency spikes or CPU-heavy requests suggest the event loop is saturated.
---

# Event Loop Diagnostics

## Purpose

diagnosing event-loop lag, blocking synchronous work, or timer starvation in Node.js.

## Activate when

- latency spikes or CPU-heavy requests suggest the event loop is saturated.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

measure before optimizing; diagnostic overhead is bounded; sampled metrics identify blocking workloads without changing behavior

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Instrument event-loop delay/utilization.\n2. Correlate with endpoints/jobs.\n3. Capture CPU profiles when needed.\n4. Identify synchronous hotspots.\n5. Benchmark after changes.

## Failure modes

Avoid:

- adding more workers without evidence; sampling every request expensively; confusing high CPU with external I/O wait.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
