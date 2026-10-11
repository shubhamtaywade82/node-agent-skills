---
name: auth0
description: Use when a Node.js backend integrates Auth0 (Okta) for hosted authentication, OIDC, SAML, or enterprise SSO.
---

# Auth0 Adapter

## Purpose

Translate the framework-neutral auth contract onto Auth0, where Auth0 handles OIDC, SAML, MFA, and enterprise SSO. Your backend validates access tokens via JWKS and enforces RBAC from token permissions.

## Activate when

- Detect `auth0` (SDK), `express-openid-connect`, `openid-client` configured against Auth0 in dependencies.
- See `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` in env.

## Repository inspection

1. `package.json` — `auth0`, `express-openid-connect`, `openid-client`, `@auth0/nextjs-auth0`. Version + adapter.
2. Env — `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER_BASE_URL`.
3. Middleware — `auth({ issuerBaseURL })`, `requireAuth`, `getSession`.
4. Token validation — JWKS URL from `<domain>/.well-known/jwks.json`. Confirm cached, not fetched per request.
5. RBAC — `permissions` array on the access token. `authorize("read:orders")`.

## Decision rules

| Concern | Rule |
|---|---|
| Tenant | `AUTH0_DOMAIN` is the tenant. One per app unless enterprise multi-tenant with custom domains. |
| OIDC flow | Authorization Code with PKCE for server-side apps. Implicit is deprecated. |
| Token validation | Validate access token signature (JWKS), `iss`, `aud`, `exp`, `azp`. Use `express-openid-connect`, not custom. |
| Audience | Set `AUTH0_AUDIENCE` to the API identifier. Without it, access tokens are opaque. |
| RBAC | Permissions on the access token (e.g., `read:orders`). Enforce in middleware, not just in handler. |
| Refresh tokens | Rotate on use. `useRefreshTokens: true` + `rotatingRefreshTokenSecret` for confidential clients. |
| SAML | Enterprise connection configured in dashboard. SAML metadata URL from Auth0. |
| Webhooks | Auth0 Management API has no webhooks; use Logs API or Actions for post-login triggers. |
| Multi-tenant | Custom domains + branded login pages per tenant. `tenant_id` in app metadata. |

## Implementation procedure

1. Detect the Auth0 adapter. Read the version.
2. Wire `express-openid-connect` `auth()` middleware. Set `AUTH0_AUDIENCE`.
3. Read the session in handlers; check `permissions` for RBAC.
4. Configure refresh token rotation.
5. Configure SAML/SSO connections in the dashboard.
6. Use Auth0 Actions for post-login enrichment (custom claims, role mapping).

## Failure modes

- JWKS fetched per request → 1 call per login; cached via `jose` `createRemoteJWKSet`.
- Audience missing from token validation → wrong token accepted.
- RBAC in handler only, not middleware → forgotten handler is open.
- Refresh token not rotated → replay attack possible.
- Custom JWT verification without issuer check → cross-tenant token confusion.
- Stale JWKS cache after rotation → 1% of logins fail until cache refreshes.

## Verification

- Test the full OIDC flow: redirect to Auth0, sign in, callback, session set.
- Validate the access token via `express-openid-connect`.
- Test RBAC: user without `read:orders` → 403.
- Test token expiry: refresh engages before expiry.
- Test JWKS rotation: fetch fresh keys, confirm no broken logins.
- Source references: https://auth0.com/docs, https://auth0.com/docs/quickstart/webapp/express/01-login, https://auth0.com/docs/api/management/v2, https://auth0.com/docs/customize/actions.
