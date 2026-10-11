---
name: clerk
description: Use when a Node.js backend integrates Clerk for hosted authentication (sessions, JWTs, OAuth, MFA, organization roles).
---

# Clerk Adapter

## Purpose

Translate the framework-neutral auth contract onto Clerk's hosted authentication, where Clerk handles signup, login, MFA, OAuth, session JWTs, and organizations. Your backend validates sessions and reads claims.

## Activate when

- Detect `@clerk/nextjs`, `@clerk/express`, `clerk-sdk-node`, or `@clerk/backend` in dependencies.
- See `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` in env.

## Repository inspection

1. `package.json` — Clerk package and version. Different adapters for Next.js, Express, Hono, Fastify.
2. Env — `CLERK_SECRET_KEY` (server), `CLERK_PUBLISHABLE_KEY` (client), `CLERK_HOSTNAME` (optional).
3. Middleware — `clerkMiddleware` (Next.js), `clerkPlugin` (Express), `withClerk` (Fastify).
4. Session retrieval — `auth()`, `req.auth`, `clerkClient.getUserId`.
5. RBAC — `organizationRole`, `has("org:role:admin")`, custom role from `sessionClaims`.

## Decision rules

| Concern | Rule |
|---|---|
| Secret key | Server-only. Never expose to client. Reads users, sets sessions, signs JWTs. Rotate on incident. |
| Publishable key | Safe for client. Used to initialize Clerk frontend. |
| Session validation | Use Clerk middleware, not custom JWT verification. Clerk JWKS rotate; middleware fetches fresh. |
| Authorization | Clerk handles authn (who). Authorization (what can they do) is yours. Read `sessionClaims` for roles. |
| Organizations | Multi-tenant via Clerk Organizations. `org_id` on the session. Per-org roles. |
| MFA | Clerk handles MFA enroll, challenge, verify. Do not roll your own. |
| Webhooks | `clerk-webhooks` for `user.created`, `user.updated`, `session.revoked`. Verify signature with `CLERK_WEBHOOK_SIGNING_SECRET`. |
| SSO | Google, GitHub, Microsoft, etc. Configured in dashboard, not code. |

## Implementation procedure

1. Detect the Clerk adapter (Next.js / Express / Hono / Fastify). Read the version.
2. Wire Clerk middleware at the app boundary. Confirm `CLERK_SECRET_KEY` is server-only.
3. Read the session in handlers via the framework's `auth()` helper. Read `sessionClaims` for roles.
4. Implement authorization as a separate policy layer that reads the session claims.
5. Register Clerk webhooks for `user.created`, `user.updated`, `session.revoked`; verify signature.
6. Test the auth flow: sign in, hit a protected route, sign out, hit a protected route → 401.

## Failure modes

- Secret key exposed to client → anyone can read/modify users.
- Custom JWT verification without JWKS rotation → broken when Clerk rotates keys.
- Authorization in middleware only, not in handler → forgotten handler is open.
- Webhook signature not verified → attacker can forge `user.created`.
- Stale session claims cached → role change takes effect late.

## Verification

- Run the auth flow: sign in, hit a protected route, sign out, hit a protected route → 401.
- Inspect the session claims for `org_id` and roles.
- Trigger `user.updated` webhook; confirm signature verification.
- Test SSO flow end-to-end.
- Test MFA enroll + challenge.
- Source references: https://clerk.com/docs, https://clerk.com/docs/backend-templates, https://clerk.com/docs/webhooks/sync-data, https://clerk.com/docs/organizations/overview.
