---
name: msw
description: Use when a Node.js project uses MSW (Mock Service Worker) to mock HTTP APIs in tests, storybook, or local dev.
---

# MSW Adapter

## Purpose

Translate the framework-neutral testing contract onto MSW, which intercepts HTTP/GraphQL requests at the service-worker (browser) or `undici` interceptor (Node) layer. No code changes to the application.

## Activate when

- Detect `msw` in devDependencies.
- See `http.get("/api/...", resolver)` or `rest.get(...)` (MSW 1.x style) in source.

## Repository inspection

1. `package.json` — `msw` version (1.x vs 2.x breaking changes).
2. Handlers — `http.get`, `http.post`, `graphql.query`. List the handlers per route.
3. Server setup — `setupServer(...handlers)` (Node) or `setupWorker(...handlers)` (browser).
4. Test config — `beforeAll(() => server.listen())`, `afterEach(() => server.resetHandlers())`, `afterAll(() => server.close())`.
5. Storybook — `mswStorybookApiMock` or `initialize({ onUnhandledRequest: "bypass" })`.

## Decision rules

| Concern | Rule |
|---|---|
| Handlers | One handler per route. Use `http.get(path, resolver)`. Resolver returns `HttpResponse.json(...)`. |
| Unhandled requests | `onUnhandledRequest: "warn"` in tests; `"bypass"` in storybook; `"error"` in production builds (should never run). |
| Test isolation | `server.resetHandlers()` in `afterEach`. Each test sets its own handlers via `server.use(...)`. |
| Overrides | `server.use(http.get(...))` for one-off tests. Restore via `resetHandlers()`. |
| Network | `server.listen({ onUnhandledRequest: "warn" })`. Do not silently bypass real API calls in tests. |
| Errors | `HttpResponse.json({ error: "..." }, { status: 500 })`. Test failure paths explicitly. |
| Latency | `new HttpResponse(null, { status: 200 })` with `await new Promise(r => setTimeout(r, 100))` for slow-network simulation. |
| Cookies | `HttpResponse.json(..., { headers: { "Set-Cookie": "..." } })`. Test auth cookie flow. |
| GraphQL | `graphql.query("User", resolver)` and `graphql.mutation("CreateUser", resolver)`. Use `operationName` for routing. |
| Worker (browser) | `mswWorker.js` in `public/`. Initialize via `worker.start()` in `main.tsx`. |

## Implementation procedure

1. Detect the MSW version (1.x vs 2.x). Read the handler format.
2. List the routes in the application; create one handler per route.
3. Configure the server: `setupServer(...handlers)` for Node, `setupWorker(...handlers)` for browser.
4. In tests: `beforeAll(server.listen)`, `afterEach(server.resetHandlers)`, `afterAll(server.close)`.
5. Set `onUnhandledRequest: "warn"` (or `"error"` in strict tests).
6. For browser: run `npx msw init public/` once to generate `mockServiceWorker.js`.

## Failure modes

- Test does not `resetHandlers` → previous test handlers leak, false positives.
- Unhandled request silently bypassed → real API called in test, flaky, leaky.
- Handler returns wrong shape → test passes but the code under test is wrong.
- Latency simulation missing → race conditions never surface in tests.
- Cookie header not set on response → auth flow tested wrong.
- MSW worker script 404 in dev → `npx msw init public/` not run.

## Verification

- Run `npm test`; confirm MSW intercepts expected routes.
- Trigger an unhandled route in test mode; confirm warning.
- Trigger the same route with `"error"` policy; confirm test fails.
- Test a 500 response; confirm error path.
- Test a slow response; confirm timeout.
- Inspect `public/mockServiceWorker.js` exists for browser tests.
- Source references: https://mswjs.io/docs/, https://mswjs.io/docs/getting-started/integrate/node, https://mswjs.io/docs/getting-started/migrations/1x-to-2x, https://mswjs.io/docs/api/http, https://mswjs.io/docs/api/graphql.
