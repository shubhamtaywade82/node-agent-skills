---
name: node-auth-security
description: Use when designing or changing authentication, authorization, JWT, OAuth, OIDC, tenant isolation, rate limiting, or SSRF defenses in a Node.js backend.
---

# Node Auth Security

## Purpose

Authentication establishes identity. Authorization establishes permission. Confusing them is the single most common Node backend security defect. This skill owns the boundary where untrusted network identity becomes trusted application principal — and where every permission decision is enforced once, at a boundary, against the data layer, not sprinkled through handlers where one omission is an open endpoint.

## Boundary with related skills

- Use `node-session-management` for the session lifecycle contract in depth (rotation, revocation lists, device sessions).
- Use `node-rate-limiting` for the limiter implementation detail (algorithms, stores, keying) — this skill owns the policy placement.
- Use `node-runtime-validation` for validating the credential inputs themselves (validated input is still not authorized input).
- Use `node-http-engineering` for the transport boundary the auth middleware sits in.
- Use `node-database-advisory-locks` when credential rotation or lockout state needs concurrency control.

## Activate when

- Changing authentication flows: password, OAuth, OIDC, SAML, magic link, MFA, passkey.
- Modifying authorization logic: RBAC, ABAC, ACLs, tenant-scoped access.
- Rotating, validating, or revoking JWT sessions, refresh tokens, or API keys.
- Adding or changing rate limits, lockout policies, or enumeration defenses.
- Diagnosing SSRF, CSRF, open redirect, or session fixation vulnerabilities.
- Adding tenant isolation boundaries (per-tenant schema, per-tenant row-level security, per-tenant cache keys).

## Repository inspection

1. Auth library — grep for `jose`, `jsonwebtoken`, `openid-client`, `oauth4webapi`, `passport`, `next-auth`, `lucia`, `better-auth`. Read its version from `package.json`.
2. Token handling — find where JWTs are signed/verified, where refresh tokens are stored, where revocation is checked.
3. Session storage — find where session state lives: stateless JWT, server-side session store (Redis, DB), cookie-only.
4. Authorization points — grep for `requireRole`, `can(`, `authorize(`, `policy(`, `@Roles`, `@UseGuards`. Find every place access control is enforced; confirm it is at the boundary, not in handlers.
5. Tenant isolation — grep for `tenantId`, `tenant_id`, `orgId`. Find the row-level filter (Postgres RLS, application-level WHERE, ORM scope).
6. Rate limiting — grep for `express-rate-limit`, `@fastify/rate-limit`, `rate-limiter-flexible`. Find the policy (per-IP, per-user, per-tenant).
7. Password storage — grep for `bcrypt`, `argon2`, `scrypt`. Find the parameters (cost factor, memory, parallelism).
8. CSRF — grep for `csrf`, `csurf` (deprecated), `@fastify/csrf-protection`. Find the token rotation strategy.
9. Cookie config — find every `res.cookie(`, `setCookie`, and the `secure`/`httpOnly`/`sameSite`/`domain`/`path` flags.

## Decision rules

| Concern | Rule |
|---|---|
| Identity vs permission | Authentication answers "who." Authorization answers "what can they do." Never shortcut authn into authz. |
| Password storage | Argon2id (m=64MiB, t=3, p=4) preferred. bcrypt cost ≥ 12. Never MD5/SHA1/unsalted. |
| JWT | Short-lived access tokens (≤ 15 min). Long-lived refresh tokens stored server-side and revocable. Never store PII in JWT. |
| JWT signing | Prefer asymmetric (RS256/ES256) for multi-service. Symmetric (HS256) only for single-service. |
| Refresh tokens | Rotate on use. Detect reuse (revoke all tokens for the user). Store hashed, never plaintext. |
| Cookies | `Secure`, `HttpOnly`, `SameSite=Lax` or `Strict`, `Path` minimal, no `Domain` unless cross-subdomain needed. |
| CSRF | For cookie-based auth: double-submit or synchronizer token. For header-based auth: rely on `SameSite` + custom header. |
| Rate limit | Login/registration/password-reset: per-IP + per-username, escalating lockout. API: per-token, per-tenant. |
| Enumeration | Login returns same error for "user not found" and "wrong password." Registration returns same response whether the email is taken or not. Password reset does not confirm the email exists. |
| Tenant isolation | Enforce in the data layer (Postgres RLS, ORM scope) not in the handler. Test with two tenants in the same integration test. |
| SSRF | Egress requests must validate destination against an allowlist. DNS must be resolved at request time, not cached. |
| Session revocation | Must work in ≤ 1 token lifetime. Stateless JWT cannot be revoked — use a revocation list or short lifetimes. |

## Implementation procedure

1. State the threat model: who is the attacker, what are they trying to do, what is the blast radius.
2. Identify the authn boundary (where identity is established) and the authz boundary (where permission is checked). They are usually different.
3. For authn: pick the mechanism (password + MFA, OAuth, OIDC, passkey). Document the trust chain from credential → principal.
4. For authz: pick the model (RBAC, ABAC, ACL). Implement the check at the boundary, not in the handler. Use a single policy function per resource type.
5. For tenant isolation: enforce in the data layer. Add an integration test that creates two tenants and confirms one cannot read the other's data.
6. For rate limiting: pick the policy (per-IP, per-user, per-tenant) and the limit. Document the lockout escape hatch (CAPTCHA, admin unlock, time-based).
7. For password storage: pick the algorithm and parameters. Write a test that confirms a password can be verified after a restart.
8. Verify the threat model with a negative test per defense: forged token → rejected; revoked session → rejected; cross-tenant read → empty.

**Reference example** — authn at the boundary middleware, authz as one policy function per resource, tenant scoping in the data layer:

```ts
// 1. AuthN: boundary middleware — the ONLY place identity is established.
const authn = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.session;                       // HttpOnly cookie, never a header-only JWT
  const principal = await verifySession(token);            // checks revocation list + expiry
  if (!principal) return next(new HttpError(401, "unauthenticated"));
  (req as AuthedRequest).principal = principal;            // trusted from here inward
  next();
};

// 2. AuthZ: ONE policy function per resource type — handlers call it, they don't improvise.
type OrderPolicy = (principal: Principal, order: OrderRow) => boolean;
const canReadOrder: OrderPolicy = (p, order) => p.tenantId === order.tenantId;  // tenant + role in one place

// 3. Tenant isolation in the data layer: RLS assumption made explicit and testable.
export async function getOrder(db: TenantDb, orderId: string): Promise<OrderRow | null> {
  // TenantDb sets `SET LOCAL app.tenant_id` per transaction (Postgres RLS enforces the filter),
  // so even a raw-SQL query cannot cross tenants — isolation is not handler discipline.
  return db.oneOrNone<OrderRow>("SELECT * FROM orders WHERE id = $1", [orderId]);
}

// Negative tests carry the threat model:
//   forged token            -> 401
//   cross-tenant order read -> 404 (not 403: don't leak existence)
//   revoked-refresh reuse   -> all sessions for that user revoked
```

The shape to recognize: identity is established once at the boundary, permission is one auditable function per resource, and tenant isolation is structural (RLS) so a forgotten `WHERE` clause cannot leak data.

## Failure modes

- Authn check at the handler level instead of a boundary middleware — one forgotten handler = open endpoint.
- JWT secret in env var, hardcoded in source, or shorter than 256 bits for HS256.
- Refresh token reuse undetected because rotation is not enforced server-side.
- Tenant isolation in the ORM `where` clause but not in raw SQL queries — one raw query leaks data.
- Rate limit per-IP only, behind a CDN that forwards `X-Forwarded-For` trusted without verification — attacker can bypass.
- Login error reveals "user not found" vs "wrong password" → username enumeration.
- Password reset confirms the email exists → enumeration.
- Cookie set without `Secure` in production (works in dev, leaks in prod).
- SSRF: egress to user-supplied URL without allowlist → attacker can hit internal metadata endpoints.
- Stateless JWT cannot be revoked — stolen token is valid for its lifetime.

## Verification

- Test happy path: valid credential → 200, valid token → access.
- Test authn failures: wrong password → 401, forged token → 401, expired token → 401, revoked token → 401.
- Test authz failures: low-privilege user → 403, cross-tenant access → 404 (not 403, to avoid leaking existence).
- Test rate limiting: N+1 attempts → 429, lockout escape → works.
- Test enumeration: login with wrong user vs wrong password → identical error and identical timing (within tolerance).
- Test CSRF: cross-site POST without token → 403.
- Test SSRF: egress to `169.254.169.254` → blocked.
- Test session revocation: logout → refresh token reuse → 401.
- Source references: https://datatracker.ietf.org/doc/html/rfc7519, https://datatracker.ietf.org/doc/html/rfc6749, https://openid.net/specs/openid-connect-core-1_0.html, https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html, https://www.postgresql.org/docs/current/ddl-rowsecurity.html.
