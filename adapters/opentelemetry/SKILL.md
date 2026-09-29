---
name: OpenTelemetry adapter
description: Use when a target Node.js repository uses OpenTelemetry JavaScript and the agent must apply Node-specific instrumentation, context propagation, metrics, traces, or telemetry export guidance.
---

# OpenTelemetry Adapter

## Purpose
Apply observability contracts through OpenTelemetry JavaScript without coupling the application to a vendor backend.

## Activate when
- OpenTelemetry packages or OTEL environment variables are present.
- Instrumentation, tracing, metrics, propagation, or exporters are changing.

## Repository inspection
Inspect OTEL package versions, SDK initialization order, auto/manual instrumentation, propagation, resource attributes, exporters, sampling, and environment configuration.

## Decision rules
- Initialize instrumentation before instrumented modules when the chosen setup requires it.
- Prefer semantic low-cardinality attributes; never attach secrets or uncontrolled payloads.
- Telemetry export must not block request correctness unless explicitly designed.
- Prefer native or supported instrumentation before custom wrappers.
- Verify ESM/CommonJS startup requirements for the repo.

## Implementation procedure
1. Detect installed OTEL packages and module mode.
2. Establish SDK startup and resource identity.
3. Enable only needed instrumentation.
4. Define stable attributes and propagation.
5. Bound exporter behavior and shutdown.
6. Verify telemetry and failure isolation.

## Failure modes
- Instrumentation loads too late.
- High-cardinality attributes explode telemetry cost.
- Export failure blocks shutdown or request completion.
- Auto-instrumentation adds unnecessary dependencies.

## Verification
Confirm startup ordering, propagation, useful telemetry, bounded overhead, exporter isolation, and graceful shutdown.