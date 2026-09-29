---
name: node-log-redaction
description: Use when request/auth/payment/PII data reaches structured logging.
---

# Log Redaction

## Purpose

preventing secrets and sensitive data from entering logs.

## Activate when

- request/auth/payment/PII data reaches structured logging.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

redaction happens before serialization/output and has explicit field policy

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Classify sensitive fields.
2. Configure structured redaction.
3. Sanitize errors.
4. Test nested objects.
5. Review third-party logging.

## Failure modes

Avoid:

- regex-only post-processing; logging full request bodies; redacting only known top-level fields.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
