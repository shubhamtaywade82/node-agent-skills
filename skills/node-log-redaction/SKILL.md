---
name: node-log-redaction
description: Use when backend code logs requests, errors, headers, configuration, or structured events.
---

# Log Redaction

## Purpose

preventing secrets, credentials, tokens, and sensitive payloads from reaching logs.

## Activate when

- backend code logs requests, errors, headers, configuration, or structured events.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

redaction is defense-in-depth; allowlists for logged fields beat blacklist-only filtering; raw payloads stay out of logs by default

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Classify sensitive fields.\n2. Configure structured redaction.\n3. Remove authorization/cookie headers.\n4. Bound payload logging.\n5. Test nested/redacted objects.\n6. Review exception paths.

## Failure modes

Avoid:

- logging whole request objects; relying on secret names alone; redacting only at one logger call site.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
