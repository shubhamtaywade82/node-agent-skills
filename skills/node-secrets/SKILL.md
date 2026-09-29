---
name: node-secrets
description: Use when handling credentials, API keys, tokens, certificates, secret rotation, secret injection, or secret exposure risks in Node.js applications.
---

# Secrets Management

## Purpose
Keep secrets out of source control and ordinary telemetry while making access, rotation, and revocation explicit.

## Activate when
- Adding credentials or third-party API access.
- Integrating a secret manager or workload identity.
- Rotating tokens, certificates, or signing keys.

## Repository inspection
Inspect secret sources, deployment injection, CI configuration, logs, error reporting, dumps, tests, and rotation mechanisms.

## Decision rules
| Concern | Rule |
|---|---|
| Storage | Prefer managed secret stores or platform identity; never commit live credentials. |
| Scope | Give credentials least privilege and the smallest practical audience. |
| Exposure | Redact secrets from logs, traces, errors, snapshots, and fixtures. |
| Rotation | Support overlap/dual-key windows when consumers cannot switch atomically. |
| Failure | Make expiry/missing-secret behavior explicit without revealing values. |

## Implementation procedure
1. Inventory each secret and consumer.
2. Choose the platform-native injection or identity mechanism.
3. Centralize access and redaction.
4. Define rotation and revocation behavior.
5. Test expiry and rotation with fake values.
6. Audit repository and CI history for accidental disclosure.

## Failure modes
- Secrets are copied into committed .env files.
- Token values appear in structured logs or exception payloads.
- Rotation invalidates all instances before replacements are ready.
- Tests use production credentials.

## Verification
Confirm no secret values appear in source, logs, artifacts, fixtures, or diagnostics; exercise rotation and failure paths.