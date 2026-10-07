---
name: node-react-integration
description: Use when a React/TypeScript client talks to a Node.js backend — choosing same-origin, cross-origin, or BFF topology, sharing or generating the API contract, sending cookies, CSRF, and CORS credentials from fetch, mapping a problem-details error envelope into forms, paginating collections, and streaming SSE or WebSocket updates to the browser.
---

# Node ↔ React Integration

## Purpose

Own the contract between a Node.js backend and a React/TypeScript client so neither side assumes what the other sends. The server side of each contract belongs to the owning Node skill; this skill owns the fit between the two. Everything inside the client (components, hooks, client state, client caching, client tests, accessibility) belongs to `react-agent-skills`, a separate pack. This pack never copies React guidance.

## Composing with react-agent-skills

Install the client-side pack next to this one with `npx skills add shubhamtaywade82/react-agent-skills`.

| Concern | Owner |
|---|---|
| Route handlers, wire shape, versioning | this pack (`node-rest-api-design`, `node-api-versioning`, `node-openapi`) |
| Request validation at the server boundary | this pack (`node-schema-validation-at-boundary`, `node-runtime-validation`) |
| Sessions, cookies, CSRF, CORS | this pack (`node-session-management`, `node-cookie-security`, `node-csrf-defense`, `node-cors-security`) |
| Topology, contract sharing, error-envelope fit, pagination keys, stream contract | this pack (`node-react-integration`) |
| Components, hooks, state, client caching, client tests, accessibility | `react-agent-skills` |

Client-side skill for each seam concern:

| Seam concern | Load from react-agent-skills |
|---|---|
| Typed client for the Node API | `typescript-api-contracts`, `typescript-runtime-contracts` |
| Query cache, mutations, pagination keys | `react-data-fetching` |
| Forms showing server validation errors | `react-forms-validation` |
| Cookie session, CSRF, logout, expiry in the browser | `browser-authentication` |
| 401/403/429/5xx recovery UX | `react-error-resilience` |
| SSE or WebSocket consumers | `frontend-realtime` |
| Generated client from the server OpenAPI document | `openapi-tooling` |
| tRPC or GraphQL clients | `trpc`, `apollo`, `urql`, `graphql-codegen` (only when detected) |
| CORS, timeouts, cancellation in the browser | `frontend-networking` |
| Client and end-to-end tests | `react-testing-engineering`, `frontend-e2e`, `msw` |

Hand-off rules:
- A contract change starts on the server, then the client parser and types move in the same change.
- A client-only change, such as a component, a hook, styling, or a render-performance fix, does not route here.
- When react-agent-skills is installed, load the row's skills for the client side.
- When it is not installed, do the server and seam work here and report the client-side follow-up and the react-agent-skills skill that owns it, rather than improvising frontend guidance.
- Next.js, Remix, or TanStack Start route handlers that live inside the React application route to react-agent-skills and its framework adapter; this skill covers a separate Node service or a Node BFF in front of one.

## Activate when

- a React component or hook calls a Node.js endpoint;
- choosing or changing how the browser reaches the Node API: same-origin reverse proxy, a Vite or webpack dev proxy, cross-origin with CORS, or a backend-for-frontend;
- sharing schemas or types between a Node service and a React app in one monorepo, or generating a client from OpenAPI;
- a React form submits to Node and must show server validation errors;
- adding pagination, filtering, sorting, server-sent events, or WebSocket updates that cross the boundary;
- a browser request fails with a CORS error, 401, a 403 CSRF rejection, 422, or a shape mismatch between server JSON and client types.

## Repository inspection

1. Topology: `package.json` workspaces, `pnpm-workspace.yaml`, `turbo.json` or `nx.json`; where the React app and the Node service live; dev proxy settings (`vite.config.*` `server.proxy`); reverse-proxy or ingress configuration; production origins of both.
2. Server contract: route definitions, request and response schemas (zod, valibot, TypeBox, Ajv, class-validator), OpenAPI generation, the error-rendering convention, and API version prefixes.
3. Auth: cookie attributes (`HttpOnly`, `Secure`, `SameSite`, `Domain`, `Path`), session store, CSRF middleware or double-submit token, CORS allowlist and `credentials` setting, and any bearer-token flow.
4. Shared code: any `contracts`, `schemas`, or `api-types` package; its `exports` map; whether it imports server-only modules (database clients, `node:` built-ins, secrets).
5. Client: the existing HTTP wrapper, runtime-validation approach, query/cache library, form library, and environment-variable prefix (`VITE_`, `NEXT_PUBLIC_`).

## Decision rules

- Prefer same-origin. Serve the API behind the same origin as the app (reverse proxy in production, dev proxy locally) so the session cookie needs no CORS credentials. Choose cross-origin only for a recorded reason, and then use an explicit origin allowlist with `credentials: true`; never reflect `Origin` and never combine `*` with credentials.
- One source of truth for the wire shape: the server schema. Either export that schema from a shared contracts package both sides import, or generate the client from the server OpenAPI document. Do not maintain a hand-copied client type next to a server schema.
- A shared contracts package contains only schemas, types, and pure functions. It must not import database clients, `node:` built-ins, configuration, or secrets, and its `exports` map must resolve in the browser bundler. A server-only import in it is a bundle leak.
- Types do not validate JSON. The client parses responses at the boundary; the server validates requests at the boundary. Generated or shared TypeScript types are not proof the response is valid at runtime.
- Map casing, dates, and money exactly once, at the boundary, never in components.
- Browser sessions use `HttpOnly`, `Secure` cookies with an explicit `SameSite`. A cookie-authenticated, state-changing request needs CSRF protection (`node-csrf-defense`) in addition to `SameSite`. Do not put session or bearer tokens in `localStorage`.
- One error envelope for every endpoint, preferably RFC 9457 `application/problem+json`, with machine-readable field errors. 400 (malformed), 401 (re-authenticate), 403 (not permitted or CSRF rejected), 404, 409 (conflict), 422 (fix input), and 429 (back off, with `Retry-After`) are distinct client outcomes.
- Every field error maps to a form field through an explicit table; errors for unmapped fields and form-level errors are shown, never dropped.
- Client-side validation is a usability aid; server validation and database constraints stay authoritative.
- Paginate with a stable, unique server-side ordering, preferably a cursor. The cursor, filters, and sort are part of the client cache key and the URL.
- Streams (SSE or WebSocket) authenticate on connect, validate every message against a versioned schema on the client, and define resume semantics (`Last-Event-ID` or a sequence number) so a reconnect neither drops nor double-applies updates.
- Only values intended for the browser go into client-prefixed environment variables. A server secret behind `VITE_` or `NEXT_PUBLIC_` is a leak.
- UI visibility is not authorization: the Node handler enforces the permission even when the button is hidden.

## Implementation procedure

1. Identify the topology, the owning route handler, its request and response schemas, and the error convention.
2. Change the server schema first; regenerate the client or rebuild the shared contracts package in the same change.
3. Route client requests through the repository's HTTP wrapper; set `credentials`, CSRF header, `Accept`, and the abort signal there.
4. Parse every response at the boundary and handle 400, 401, 403, 404, 409, 422, 429, and unexpected statuses explicitly; map the error envelope to field and form-level errors.
5. Put every result-changing input into the query key and the request URL.
6. Test the seam: a server integration test pinning status, headers, and body shape; a client parser test accepting the real shape and rejecting a drifted one; CSRF header present on mutations; CORS allowed and denied origins when cross-origin.

## Failure modes

- `as Order` casts on `response.json()` with no runtime parse, so a renamed field becomes `undefined` in the UI;
- a shared types package that imports the ORM client or `process.env`, pulling server code or secrets into the browser bundle;
- a hand-written client type drifting from the server schema;
- `cors({ origin: true, credentials: true })` reflecting any origin;
- disabling CSRF protection, or switching to `SameSite=None`, to make a cross-origin fetch work;
- tokens in `localStorage`, readable by any injected script;
- endpoint-specific error shapes, so the client parses each one differently and drops unknown fields;
- offset pagination over a non-unique sort, producing duplicate or skipped rows;
- an SSE or WebSocket client that applies messages without a schema check or replays them after reconnect.

## Reference example

Type-checked with `tsc --strict` (plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`). The server renders RFC 9457 problem details; the client turns them into a typed result.

```ts
// contracts/src/problem.ts — shared, browser-safe: no node: imports, no config, no secrets.
export interface FieldIssue { readonly path: string; readonly message: string }
export interface ValidationProblem {
  readonly type: "https://errors.example.com/validation";
  readonly title: string;
  readonly status: 422;
  readonly errors: readonly FieldIssue[];
}

export function isValidationProblem(value: unknown): value is ValidationProblem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v["status"] === 422 && Array.isArray(v["errors"]) &&
    v["errors"].every((e: unknown) =>
      typeof e === "object" && e !== null &&
      typeof (e as Record<string, unknown>)["path"] === "string" &&
      typeof (e as Record<string, unknown>)["message"] === "string");
}

// client: submit a form to the Node API on the same origin.
type FieldErrors = Partial<Record<"sku" | "quantity", string[]>>;
export type SubmitResult =
  | { kind: "created"; id: string }
  | { kind: "invalid"; fields: FieldErrors; form: string[] }
  | { kind: "unauthenticated" }
  | { kind: "rate-limited"; retryAfterSeconds: number | null };

const FIELD_FOR_PATH: Readonly<Record<string, keyof FieldErrors>> = { sku: "sku", quantity: "quantity" };

export async function createOrder(
  input: { sku: string; quantity: number }, csrfToken: string, signal: AbortSignal,
): Promise<SubmitResult> {
  const response = await fetch("/api/v1/orders", {
    method: "POST",
    credentials: "same-origin", // HttpOnly session cookie; nothing in localStorage
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify(input),
    signal,
  });

  if (response.status === 401) return { kind: "unauthenticated" };
  if (response.status === 429) {
    const retry = Number(response.headers.get("Retry-After"));
    return { kind: "rate-limited", retryAfterSeconds: Number.isFinite(retry) ? retry : null };
  }
  if (response.status === 422) {
    const body: unknown = await response.json();
    if (!isValidationProblem(body)) throw new Error("422 without a validation problem body");
    const result: SubmitResult = { kind: "invalid", fields: {}, form: [] };
    for (const issue of body.errors) {
      const field = FIELD_FOR_PATH[issue.path];
      if (field) (result.fields[field] ??= []).push(issue.message);
      else result.form.push(issue.message); // never drop an error the user cannot see
    }
    return result;
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const created: unknown = await response.json();
  const id = typeof created === "object" && created !== null ? (created as Record<string, unknown>)["id"] : undefined;
  if (typeof id !== "string") throw new Error("created.id missing");
  return { kind: "created", id };
}
```

## Verification

1. Server: an HTTP integration test (`node-http-testing`) for the endpoint asserting status, `Content-Type`, and the exact body keys the client parses, including the 422 problem body and the 429 `Retry-After` header.
2. Client: parser tests that accept the real response and reject a drifted one, and a test that a mutation sends the CSRF header and `credentials`.
3. Cross-origin topology: allowed origin succeeds with credentials; a disallowed origin gets no `Access-Control-Allow-Origin`.
4. Shared contracts package: build the React app and confirm the bundle contains no server-only module (database client, `node:` built-ins, secrets).
5. Run the repository gate for both workspaces.
