---
name: node-log-redaction
description: Use when application logs contain request, auth, payload, or error data.
---

# Log Redaction

## Purpose

preventing secrets and sensitive data from entering Node.js logs.

## Activate when

- application logs contain request, auth, payload, or error data.
- The issue affects Node.js runtime behavior, dependencies, diagnostics, or telemetry.

## Repository inspection

1. Detect Node.js version, package manager, module system, deployment model, and observability stack.
2. Locate authoritative runtime/package/configuration sources and CI install commands.
3. Inspect lifecycle, memory, event-loop, logging, and telemetry instrumentation.
4. Confirm exact versions before using diagnostic APIs.

## Decision rules

redaction happens before serialization/output; sensitive fields are centrally classified; raw payload logging is opt-in and bounded

- Prefer measured evidence over inferred runtime behavior.
- Protect secrets and diagnostic artifacts.
- Keep production diagnostics bounded and reversible.
- Preserve repository-native tooling and deployment ownership.

## Implementation procedure

1. Define sensitive-field policy.
2. Configure logger serializers/redaction.
3. Redact errors and headers.
4. Test nested structures.
5. Scan representative logs.

## Failure modes

Avoid:

- regex-only redaction after serialization; logging Authorization/cookies; allowing debug logs in production.
- Masking root causes with larger resource budgets.
- Adding diagnostics that materially change application behavior.

## Verification

1. Add a failing regression or contract test first.
2. Reproduce the issue with representative workloads.
3. Run focused tests and full repository validation.
4. Verify resource/telemetry overhead and cleanup.
5. Inspect logs and diagnostics for secret leakage.
