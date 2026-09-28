---
name: node-observability
description: Use when adding or reviewing Node.js logging, metrics, distributed tracing, health checks, audit events, or production diagnostics.
---

# Node Observability

## Purpose
Make production behavior measurable and diagnosable without leaking sensitive data.

## Activate when
Ship production paths, add telemetry, diagnose incidents, or define health/audit signals.

## Repository inspection
Inspect logger, telemetry pipeline, propagation, metric naming, health endpoints, alerts, and redaction policy.

## Decision rules
Use structured logs with stable event names. Use traces for causal paths and metrics for aggregates. Bound metric cardinality. Redact secrets. Separate readiness from liveness and audits from diagnostics.

## Implementation procedure
1. Identify operational question. 2. Choose signal type. 3. Define stable attributes. 4. Instrument boundary/failure path. 5. Verify correlation and redaction.

## Failure modes
Full request/response logging; unbounded metric labels; broken trace propagation; readiness always healthy.

## Verification
Exercise success/failure paths and confirm correlation, telemetry, health semantics, and redaction.

## Source foundation
https://opentelemetry.io/docs/languages/js/
