---
name: node-oauth-client-security
description: Use when a Node service integrates with an OAuth 2/OIDC provider.
---

# OAuth Client Security

## Purpose

implementing backend OAuth clients with least privilege, state protection, PKCE, redirect URI controls, and token hygiene.

## Activate when

- a Node service integrates with an OAuth 2/OIDC provider.
- The change affects reliability, security, identity, or production operations.

## Repository inspection

1. Detect runtime, package manager, framework, observability stack, deployment model, and test commands.
2. Locate the existing owner of the behavior and its production contract.
3. Inspect configuration, dependency versions, CI, runbooks, and adjacent tests.
4. Verify exact library versions before using adapter-specific APIs.

## Decision rules

client behavior follows the grant's security requirements; redirect URIs are exact; tokens stay server-side when appropriate; issuer and audience validation are explicit

- Treat runtime data and external identity/provider responses as untrusted.
- Preserve security and data-integrity guarantees during failure handling.
- Make thresholds, ownership, and lifecycle semantics explicit.
- Prefer the smallest change that makes the contract measurable and testable.

## Implementation procedure

1. Identify client type/grant.
2. Select PKCE/state/nonce needs.
3. Configure exact redirects/scopes.
4. Validate issuer/token claims.
5. Store tokens safely.
6. Implement refresh/revocation.
7. Test error/CSRF/replay paths.

## Failure modes

Avoid:

- wildcard redirects; storing tokens in logs; accepting any issuer; skipping state/PKCE when required.
- Hidden operational ownership or implicit security assumptions.
- Tests that prove only implementation details.

## Verification

1. Add focused tests before behavior changes.
2. Exercise failure, replay, revocation, or operational recovery paths as applicable.
3. Run the repository test suite and all documented production gates.
4. Verify telemetry and runbook/operator behavior.
5. Record residual risk and rollback implications.
