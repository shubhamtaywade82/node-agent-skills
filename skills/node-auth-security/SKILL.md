---
name: node-auth-security
description: Use when implementing or reviewing Node.js authentication, authorization, sessions, JWT/OAuth/OIDC, tenant isolation, rate limiting, or API security.
---

# Node Auth Security

## Purpose
Protect trust boundaries and enforce permission at the execution boundary.

## Activate when
Implement credentials/sessions, roles, ownership, tenancy, privileged operations, or abuse controls.

## Repository inspection
Trace identity establishment, credential storage, token validation, authorization checks, tenant context, privileged operations, secrets, and rate limits.

## Decision rules
Authentication establishes identity; authorization establishes permission. Re-authorize at the execution boundary. Default deny privileged operations. Validate token claims according to the protocol. Treat URLs, uploads, redirects, and webhooks as attacker-controlled.

## Implementation procedure
1. Map assets and trust boundaries. 2. Separate authn/authz. 3. Enforce resource/tenant authorization where access occurs. 4. Validate external values. 5. Add abuse-case tests.

## Failure modes
Valid JWT treated as authorization; client-supplied tenant IDs trusted; credentialed wildcard CORS; unrestricted outbound URLs; secrets in logs.

## Verification
Test unauthenticated, authenticated-but-forbidden, cross-tenant, malformed, expired, and abuse-rate cases.

## Source foundation
https://owasp.org/API-Security/
