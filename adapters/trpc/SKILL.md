---
name: trpc
description: Use when a Node.js backend uses tRPC for end-to-end typesafe APIs between a TypeScript client and server.
---

# tRPC Adapter

## Purpose

Translate the framework-neutral HTTP/API contract onto tRPC, where the server's `AppRouter` type is imported by the client (types only, not JS) to produce end-to-end type-safety.

## Activate when

- Detect `@trpc/server`, `@trpc/client`, `@trpc/react-query`, or `@trpc/next` in dependencies.
- See `initTRPC.create()` and `router({ ... })` in the server.

## Repository inspection

1. `package.json` — tRPC packages and versions (v10 vs v11 breaking changes).
2. Router — find `t.router({ ... })`. List the procedures (`publicProcedure`, `protectedProcedure`).
3. Context — `createContext` function. Find what is injected (user, db, cache).
4. Middleware — `t.middleware`. Find auth, rate limit, logging middleware.
5. Validation — `z` (Zod) input schemas on procedures.
6. Client — `createTRPCProxyClient` or `createTRPCReact`. Confirm the AppRouter type is imported.
7. Subscription — `t.procedureSubscription` or `observable`. Find the subscription transport (SSE, WebSocket).

## Decision rules

| Concern | Rule |
|---|---|
| Procedure types | `query` for reads, `mutation` for writes, `subscription` for streams. Pick the right one. |
| Validation | Every procedure has a `z` schema for `input`. No bare `input: z.any()`. |
| Auth | Protected procedures go through `protectedProcedure` middleware, not `if (!user) throw` in the handler. |
| Context | Per-request context. Do not store mutable state in the context object across requests. |
| Error envelope | `TRPCError` with `code: "BAD_REQUEST" | "UNAUTHORIZED" | ...`. Map to canonical client-side error. |
| Subscription | Server-push via SSE or WebSocket. Do not poll. |
| Batching | `batchLink` on the client batches multiple procedures into one HTTP call. Bound the batch size. |
| Transformer | SuperJSON for `Date`, `BigInt`, `Map`, `Set`. Add to both server `transformer` and client `transformer`. |
| AppRouter type | Server exports the type; client imports `type AppRouter`. Never a JS import of the router to the client. |
| React Query | Use `@trpc/react-query` for client-side caching. Configure `staleTime`, `refetchOnWindowFocus`. |

## Implementation procedure

1. Detect the tRPC version (v10 vs v11). Read the router definition.
2. Construct the context function. Inject user, db, cache per request.
3. Define procedures with `z` input schemas. Mark protected procedures via `protectedProcedure` middleware.
4. Configure SuperJSON transformer on both server and client.
5. Export `type AppRouter` from the server. Import as type-only on the client.
6. Configure batching on the client `batchLink` with `maxBatchSize` (typically 10).
7. Add a type-safety test: rename a field → client TS error.

## Failure modes

- No `z` schema on a mutation input → unvalidated data on the server.
- Auth check in the handler instead of middleware → forgotten handler is open.
- Mutable state in context across requests → race condition under load.
- Client imports the router (JS), not the type → server bundle shipped to client.
- SuperJSON on server only, not client → `Date` becomes a string, type lies.
- Subscription via WebSocket without auth → unauthenticated push.

## Verification

- Run the dev server; call a procedure from the client; confirm type-safety (rename a field → client TS error).
- Inject a bad input; confirm `z` rejects.
- Run an unauthorized call to a protected procedure; confirm 401.
- Run a subscription; confirm server-push.
- Inspect the client bundle for the router (should not be there).
- Source references: https://trpc.io/docs, https://trpc.io/docs/server/context, https://trpc.io/docs/server/middlewares, https://trpc.io/docs/client/links, https://trpc.io/docs/transformers.
