---
name: node-api-content-negotiation
description: Use when clients send Accept, Content-Type, language, encoding, or representation preferences.
---

# API Content Negotiation

## Purpose

designing HTTP APIs that negotiate representations without ambiguous behavior.

## Activate when

- clients send Accept, Content-Type, language, encoding, or representation preferences.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

server-supported formats are explicit; unsupported or ambiguous representations have deterministic responses; security policy is independent of negotiated format

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Inventory supported media types.\n2. Define precedence.\n3. Emit Content-Type/Vary correctly.\n4. Reject unsupported bodies.\n5. Test Accept wildcards and quality weights.

## Failure modes

Avoid:

- returning a default representation that violates client constraints; forgetting Vary; parsing a body under the wrong media type.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
