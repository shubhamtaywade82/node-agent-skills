# Wave 8 — operations, delivery, and security

Adds 18 framework-neutral skills covering disaster recovery, backup/restore, chaos engineering, capacity and cost management, multi-region/failover, graceful degradation, deterministic time handling, sessions/cookies/CORS/security headers, CI/CD delivery, infrastructure-as-code, observability validation, and runbook engineering.

Adds 8 conditional adapters:
GitHub Actions, Terraform, Helm, Argo CD, AWS CloudWatch, Sentry Node.js, Datadog Node.js tracer, and New Relic Node.js.

## Guardrails

- Recovery procedures are executable and tested.
- Security controls do not silently weaken during degradation.
- Delivery configuration is reproducible and reviewable.
- Telemetry is validated for semantics, correlation, cardinality, and redaction.
- Adapters are version-scoped and selected only after repository inspection.

## Verification

npm test
npm run validate
