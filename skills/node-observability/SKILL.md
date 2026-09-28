---
name: node-observability
description: operations
---

# Node Observability

## Purpose
Use when adding or reviewing Node.js logging, metrics, distributed tracing, health checks, audit events, or production diagnostics.

## Activate when
Make production behavior measurable and diagnosable without leaking sensitive data.

## Repository inspection
- Production paths.
- Telemetry changes.
- Incident diagnosis.
- Health or audit signals.

## Decision rules
Inspect logger, telemetry pipeline, propagation, metric naming, health endpoints, alerts, and redaction policy.

## Implementation procedure
- Use structured logs with stable event names.
- Use traces for causal cross-service paths and metrics for aggregate behavior.
- Bound metric cardinality.
- Redact secrets before emission.
- Separate readiness from liveness.
- Keep audit events distinct from diagnostic logs.

## Failure modes
1. Identify the operational question.
2. Choose signal type.
3. Define stable attributes.
4. Instrument the boundary and failure path.
5. Verify correlation and redaction.

## Verification
- Full request/response logging.
- User IDs as unbounded metric labels.
- Broken trace propagation.
- Readiness always reporting healthy.

## Source foundation
Exercise success and failure paths and confirm correlation, telemetry, health semantics, and redaction.
