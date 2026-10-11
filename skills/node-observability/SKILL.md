---
name: node-observability
description: Use when designing or changing Node.js logging, metrics, tracing, OpenTelemetry, health checks, or audit logging.
---

# Node Observability

## Purpose

Observability is the difference between "we know it failed" and "we know why it failed." Logs, metrics, traces, and health checks are first-class engineering artifacts, not afterthoughts.

## Activate when

- Adding or changing structured logging (pino, winston, bunyan).
- Defining metrics (Prometheus, OpenTelemetry metrics, Datadog, NewRelic).
- Adding distributed tracing (OpenTelemetry SDK, trace context propagation).
- Changing health check endpoints (`/healthz`, `/readyz`, `/livez`).
- Adding audit logging for security-sensitive operations.
- Diagnosing a production incident from observability data.

## Repository inspection

1. Logger — grep for `pino`, `winston`, `bunyan`, `@nestjs/common` Logger. Read the configuration: log level, redaction, transport, pretty/JSON.
2. Metrics — grep for `prom-client`, `@opentelemetry/api`, `@opentelemetry/sdk-node`, `datadog`, `newrelic`. Find the metric namespace and the labels.
3. Tracing — grep for `@opentelemetry/api`, `trace.getTracer`, `context.active`. Find the tracer setup file.
4. Health checks — grep for `/healthz`, `/readyz`, `/livez`. Read what they observe (process, DB, downstream, queue).
5. Audit logging — grep for `audit`, `auditLog`, `AuditEvent`. Find where security-sensitive events are recorded.
6. Log redaction — grep for `redact`, `redaction`, `secret`, `password`, `token`. Confirm PII and secrets are redacted.
7. Sampling — grep for `sample`, `sampling`, `ratio`. Find the trace sampling decision.

## Decision rules

| Concern | Rule |
|---|---|
| Structured logs | JSON, one line per event, with `timestamp`, `level`, `message`, `request_id`, `trace_id`, `span_id`, `user_id?`. |
| Log levels | error (action needed), warn (anomaly), info (lifecycle), debug (verbose), trace (very verbose). Never log at info for hot-path events. |
| Secrets | Never log passwords, tokens, JWTs, API keys, raw payloads of authenticated requests. Use redaction paths in the logger. |
| Metrics | Counter for monotonic (requests_total, errors_total). Gauge for current state (queue_depth, in_flight). Histogram for distributions (latency, payload_size). |
| Metric labels | Low cardinality: `route`, `method`, `status`. Never `user_id`, `request_id`, `session_id` as labels. |
| Tracing | Propagate W3C `traceparent` header across HTTP and queue boundaries. Sample at ≥ 1% in production; 100% in dev/staging. |
| Health checks | `/healthz` observes the process (always 200 if running). `/readyz` observes dependencies (200 only when DB, queue, downstream are reachable). |
| Audit logging | Append-only, tamper-evident. Record who, what, when, from where, with what authority. Store separately from application logs. |
| Cardinality | Bound metric label combinations. `route` × `method` × `status` is fine (hundreds of series). `user_id` × `endpoint` is not (millions). |
| PII | Redact email, phone, IP (or hash them). Never log raw request bodies of authenticated endpoints. |
| Sampling | Sample traces; never sample logs of errors. Errors must be 100% captured. |
| Slow logs | Slow query log threshold (typically 100ms). Slow request log threshold (typically p99 latency). |

## Implementation procedure

1. Identify what needs to be observable: the request lifecycle, the job lifecycle, dependency health, security-sensitive actions.
2. Pick the observability surface: structured logs (one per request lifecycle event), metrics (the four golden signals: latency, traffic, errors, saturation), traces (per request, propagated across boundaries).
3. Wire `traceparent` propagation: HTTP middleware sets the trace context; queue publishers propagate it in message attributes; consumers extract and continue it.
4. Wire structured logging: one logger, configured at startup, redaction paths set, level from env, JSON transport in prod, pretty in dev.
5. Wire metrics: counter for request totals, histogram for latency, gauge for queue depth. Expose `/metrics` for Prometheus scrape.
6. Wire health checks: `/healthz` returns 200 if the process is running; `/readyz` returns 200 only after dependencies are reachable.
7. Wire audit logging: a separate logger that writes to a separate destination (file, table, service) with append-only semantics.
8. Test under load: confirm logs are structured, metrics are exported, traces are propagated, health checks reflect dependency state.

## Failure modes

- Logs as free-text strings → unparseable in production.
- PII in logs (email, phone, raw JWT) → compliance violation.
- High-cardinality metric labels (user_id) → metric series explosion, Prometheus OOM.
- Trace context not propagated across a queue boundary → traces break at the consumer.
- `/healthz` and `/readyz` both check the DB → rolling deploy kills traffic because the new pod is not "ready" yet.
- `/readyz` checks the DB with a slow query → readiness probe times out, pod marked unready.
- Sampling at 100% in production → expensive; at 0% → blind.
- Slow query log threshold too high (10s) → 9s queries pass silently.
- Audit log mixed with application log → tamperable, not auditable.
- Counter used for current state (queue depth) → can only go up, never reflects reality.

## Verification

- Run the app, hit an endpoint, confirm: log line is JSON with `trace_id`, metric increments, trace appears in the collector.
- Stop the DB, hit `/readyz` → 503; restart, → 200.
- Send a request with `traceparent: 00-<trace-id>-<span-id>-01`; confirm the response's downstream calls carry the same `trace-id`.
- Inspect `redact` paths by triggering an endpoint with a password; confirm the password is redacted in logs.
- Send a request with `X-Forwarded-For` set; confirm IP is hashed or redacted, not raw.
- Confirm the audit log entry for a security-sensitive action is written to its separate destination.
- Confirm metric label cardinality is bounded (no `user_id`, `request_id` labels).
- Source references: https://opentelemetry.io/docs/languages/js/, https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/overview/tracecontext.md, https://prometheus.io/docs/concepts/, https://github.com/pinojs/pino/blob/main/docs/api.md, https://sre.google/sre-book/monitoring-distributed-systems/.
