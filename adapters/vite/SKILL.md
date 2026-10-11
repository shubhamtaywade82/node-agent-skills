---
name: vite
description: Use when a Node.js project uses Vite as the dev server or bundler (frontend or backend via Vite Node).
---

# Vite Adapter

## Purpose

Translate the framework-neutral build/dev contract onto Vite, which is ESM-native in dev (on-demand compile, no pre-bundle of source) and Rollup under the hood for production builds.

## Activate when

- Detect `vite` in devDependencies or `vitest` (uses Vite under the hood).
- See `vite.config.ts` at the repo root.

## Repository inspection

1. `package.json` — `vite` version, `vitest`, `@vitejs/plugin-react`, `@vitejs/plugin-vue`.
2. `vite.config.ts` — `plugins`, `build.target`, `build.rollupOptions`, `server.proxy`, `optimizeDeps`.
3. Env — `import.meta.env.VITE_*`. Confirm secrets are not prefixed `VITE_` (they would be in the client bundle).
4. `ssr` config — for SSR or backend apps. `ssr.external`, `ssr.noExternal`.
5. Workspaces — monorepo with multiple `vite.config.ts`. Find the project references.
6. Build output — `dist/`. Confirm `assets`, `manifest.json` for cache-busting.

## Decision rules

| Concern | Rule |
|---|---|
| Dev server | ESM-native, on-demand compile. No `node_modules` pre-bundling for source code; only for CJS deps. |
| Build | Rollup under the hood. `build.target` defaults to `modules` (ESM). Set to `es2020` or higher for modern browsers. |
| Env vars | `VITE_*` is shipped to the client. Never prefix secrets. Use `loadEnv` and inject server-only vars into the SSR context. |
| Optimize deps | `optimizeDeps.include` for CJS deps that must be pre-bundled; `exclude` for ESM-friendly ones. |
| SSR | `ssr.external` for deps that should not be bundled (e.g., Prisma). `ssr.noExternal` for ESM-only deps that must be. |
| HMR | React Fast Refresh, Vue HMR. Do not break HMR by importing side-effectful modules at the top level. |
| Code splitting | Rollup defaults to one chunk per dynamic import. Use `manualChunks` for vendor splits. |
| Source maps | `build.sourcemap: true` in dev; `false` or `hidden` in prod to avoid leaking source. |
| Path aliases | `resolve.alias` for `@/` → `./src/`. Confirm tsconfig matches. |
| Workers | Web Workers via `?worker` suffix; SharedWorkers via `?sharedworker`. |

## Implementation procedure

1. Detect the Vite version and plugins (React, Vue, Svelte). Read `vite.config.ts`.
2. Confirm env vars: no secret is prefixed `VITE_`. Use `loadEnv` for server-only vars.
3. Configure `optimizeDeps`: `include` CJS deps; `exclude` ESM-friendly ones.
4. Configure `ssr` for SSR apps: `external` for heavy deps (Prisma), `noExternal` for ESM-only.
5. Configure `build.rollupOptions.output.manualChunks` for vendor splits.
6. Configure `build.sourcemap` to `false` or `hidden` in prod.
7. Add `vitest` with the same `vite.config.ts` for tests.

## Failure modes

- Secret env var prefixed `VITE_` → shipped to client.
- CJS dep not in `optimizeDeps.include` → dev server crashes on import.
- SSR with Prisma bundled into the SSR build → runtime crash.
- HMR broken by side-effectful import at top level → full reload on every change.
- No `manualChunks` → one giant vendor chunk, slow initial load.
- Source maps shipped to production → source code leaked.

## Verification

- Run `vite build`; inspect `dist/` for chunks, manifest, source maps.
- Run `vite dev`; confirm HMR works on save.
- Inspect the client bundle for `VITE_` secrets (should be none).
- Run an SSR build; confirm Prisma is external.
- Run `vitest`; confirm it uses the same `vite.config`.
- Source references: https://vite.dev/guide/, https://vite.dev/config/, https://vite.dev/guide/env-and-mode, https://vite.dev/guide/features, https://vite.dev/guide/ssr.
