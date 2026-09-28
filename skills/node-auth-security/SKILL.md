---
name: node-auth-security
description: security
---

# Node Auth Security

## Purpose
Use when implementing or reviewing Node.js authentication, authorization, sessions, JWT/OAuth/OIDC, tenant isolation, rate limiting, or API security.

## Activate when
Protect trust boundaries and enforce permission at the execution boundary.

## Repository inspection
- Credential or session flows.
- Roles, ownership, or tenant access.
- Sensitive operations.

## Decision rules
Trace identity establishment, credential storage, token validation, authorization checks, tenant context, privileged operations, secrets, and rate limits.

## Implementation procedure
- Authentication establishes identity; authorization establishes permission.
- Re-authorize at the execution boundary.
- Default deny for privileged operations.
- Validate token issuer, audience, expiry, and signature according to the protocol.
- Treat URLs, uploads, redirects, and webhook data as attacker-controlled.
- Never log credentials or authorization headers.

## Failure modes
1. Map assets and trust boundaries.
2. Separate authentication from authorization.
3. Enforce resource or tenant authorization where access occurs.
4. Validate external values.
5. Add abuse-case tests.

## Verification
- Valid JWT treated as authorization.
- Client-supplied tenant IDs trusted.
- Credentialed wildcard CORS.
- Unrestricted outbound URL fetching.

## Source foundation
Test unauthenticated, authenticated-but-forbidden, cross-tenant, malformed, expired, and abuse-rate cases.
