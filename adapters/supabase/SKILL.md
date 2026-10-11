---
name: supabase
description: Use when a Node.js backend uses Supabase (Postgres + Auth + Realtime + Storage + Edge Functions).
---

# Supabase Adapter

## Purpose

Translate the framework-neutral persistence/auth/storage contract onto Supabase, which combines Postgres + GoTrue auth + Realtime + Storage + Edge Functions (Deno) under one project URL.

## Activate when

- Detect `@supabase/supabase-js` in dependencies.
- See `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`) in env.

## Repository inspection

1. `package.json` — `@supabase/supabase-js` version, `@supabase/ssr` for session cookies.
2. Env — `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only, never client), `SUPABASE_ANON_KEY`.
3. Client setup — find where `createClient(url, key)` is constructed; confirm key choice (anon vs service role).
4. RLS — read `supabase/migrations/*.sql` for `CREATE POLICY` statements. Confirm policies exist for every table.
5. Auth — `supabase.auth.getSession()`, `onAuthStateChange`, `signInWithPassword`, `signInWithOAuth`.
6. Storage — `supabase.storage.from(bucket)`, `upload`, `createSignedUrl`.
7. Realtime — `supabase.channel(name).on("postgres_changes", ...).subscribe()`.

## Decision rules

| Concern | Rule |
|---|---|
| Service role key | Server-only. Bypasses RLS. Never exposed to client. Use only for trusted operations (admin, migrations, server-to-server). |
| Anon key | Safe to expose to client. RLS governs access. Use for all client operations. |
| RLS | Required on every table. Default deny. Write explicit policies for SELECT/INSERT/UPDATE/DELETE. Test with both authenticated and anon users. |
| Auth | Use `@supabase/ssr` for server-side session cookie management. Do not roll your own. |
| Realtime | Authorized by RLS. Subscribe with the user's session. Bound the channel count per client. |
| Storage | Private buckets need signed URLs. Public buckets for public assets. Use `upsert` carefully (replaces file). |
| Edge Functions | Deno-based. Use `supabase functions serve` locally. `import` from `esm.sh`. No npm. |
| Migrations | `supabase migration new <name>`, `supabase db push`. Test against a fresh local Postgres via `supabase start`. |
| Backups | Daily on free; PITR on Pro+. Do not rely on Supabase for primary backup — export via `pg_dump` periodically. |

## Implementation procedure

1. Detect the Supabase packages and version. Confirm `@supabase/ssr` is used for session cookies.
2. Read the migrations; confirm every table has RLS policies.
3. Construct the server client with the service role key (server only) and the browser client with the anon key.
4. Implement the auth flow: `signInWithPassword`, `signInWithOAuth`, `getSession`, `signOut`. Use `@supabase/ssr` cookies.
5. For Realtime: subscribe with the user session; confirm RLS filter; bound channel count.
6. For Storage: upload to a private bucket; return a signed URL to the client.
7. Test RLS with two users; confirm cross-tenant read returns 404/empty.

## Failure modes

- Service role key shipped to client → RLS bypassed, anyone can do anything.
- Table without RLS → default is deny, but easy to forget; production fails on first user request.
- Realtime subscription with no RLS filter → user receives every row, including other users'.
- Auth session stored in localStorage (default) → XSS steals it. Use `@supabase/ssr` for cookie-based.
- Storage upload without `upsert` → duplicate files accumulate.
- Edge Function pulls npm dependency via `esm.sh` cold path → 1s cold start every request.

## Verification

- Run `supabase start` locally; run migrations; test RLS with two users.
- Confirm the service role key is server-only.
- Run the auth flow end-to-end (sign up, sign in, sign out).
- Inspect `supabase status` for the local stack.
- Confirm Realtime subscription uses the user session and respects RLS.
- Source references: https://supabase.com/docs, https://supabase.com/docs/guides/auth/server-side-rendering, https://supabase.com/docs/guides/realtime, https://supabase.com/docs/guides/storage, https://supabase.com/docs/guides/functions.
