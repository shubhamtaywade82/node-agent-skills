---
name: node-runtime-foundations
description: Use when designing or changing Node.js runtime lifecycle, ESM/CJS interop, package exports, process signals, startup, or shutdown behavior.
---

# Node Runtime Foundations

## Purpose

Establish the runtime contract: process lifecycle, module system, signals, startup, and shutdown. Every Node backend runs inside this contract — getting it wrong produces slow startup, ungraceful shutdown, mysterious ESM/CJS import errors, and worker-thread leaks that only appear under load.

## Activate when

- The change affects process startup, shutdown, or signal handling.
- ESM/CommonJS interop is involved (mixed `import` and `require`, dual-package hazards).
- `package.json` `exports`, `main`, `module`, `types` are being changed.
- Worker threads, child processes, or `cluster` are being introduced.
- Startup latency or cold-boot time is the issue.
- The process exits unexpectedly, hangs on shutdown, or fails readiness checks during rolling deploys.

## Repository inspection

1. `package.json` — `"type": "module"` vs `"commonjs"`, `engines.node`, `exports`, `main`, `module`, `types`, and `bin` fields.
2. `tsconfig.json` — `module`, `moduleResolution`, `target`, `verbatimModuleSyntax`, `node16`/`nodenext` resolution.
3. Entry points — `src/index.ts`, `src/main.ts`, `src/server.ts`, and any CLI entry declared in `bin`.
4. Signal handlers — grep for `process.on("SIGTERM"`, `process.on("SIGINT"`, `process.on("beforeExit"`, `process.on("exit"`.
5. Worker usage — grep for `worker_threads`, `child_process`, `cluster`.
6. Health/readiness endpoints — find where `/healthz` and `/readyz` are defined and what they observe.
7. Process manager — read `Dockerfile`, `systemd` unit, `kubernetes` manifest, or `pm2` config to see how the process is supervised.

## Decision rules

| Concern | Rule |
|---|---|
| Module system | Pick one (prefer ESM for new code). Treat mixed ESM/CJS as a runtime contract, not a build-time choice. |
| Package exports | Use the `exports` field to define public surface; never expose internal paths. |
| Startup | Keep cold start under the SLO. Top-level `await` is allowed but bound it. |
| Shutdown | Handle SIGTERM: stop accepting new work, drain in-flight, close DB pools, exit within the grace period (default 30s on Kubernetes). |
| Signals | SIGTERM = graceful stop. SIGINT = interactive interrupt. SIGHUP = config reload if applicable. Never crash on SIGTERM. |
| Process exit | Exit with explicit codes: 0 = success, 1 = unrecoverable error, 130 = SIGINT, 143 = SIGTERM-with-graceful-shutdown. |
| Workers | Worker threads are not free; bound the pool and ensure they terminate on parent shutdown. |
| Async context | Prefer `AsyncLocalStorage` over module-level mutable state for request context. |
| Uncaught exceptions | `process.on("uncaughtException", ...)` is for logging + scheduled exit, not for continuing. |

## Implementation procedure

1. State the runtime invariants: module system, Node version, signal contract, max startup time, max shutdown time.
2. Inspect `package.json` `exports`/`main`/`types` for correctness and consistency with `tsconfig`.
3. Add or fix signal handlers: SIGTERM triggers graceful shutdown; never crash on it.
4. Ensure startup is observable: log when ready, expose `/readyz` only after pools are open.
5. Implement shutdown sequence: stop accepting → drain in-flight → close pools → flush logs → exit.
6. Add a startup-shutdown test that exercises the full lifecycle.
7. Run focused tests, typecheck, and the full suite.

## Failure modes

- Process hangs on shutdown because a DB pool or HTTP keep-alive was never closed.
- SIGTERM crashes the process because no handler is registered (Node default: exit with 128+15=143, but Kubernetes sees it as a crash).
- Top-level `await` in ESM blocks startup indefinitely because an external service is down.
- Mixed ESM/CJS produces " ERR_REQUIRE_ESM" or "Cannot use import statement outside a module" errors in production but not in tests.
- Worker threads leak across hot reloads in development, exhausting file descriptors.
- `process.on("uncaughtException", ...)` is used to keep the process alive — it should exit, not recover.
- Readiness check returns 200 before the DB pool is open, causing traffic to a not-ready instance.

## Verification

- Run the lifecycle test: start process, hit `/readyz`, send SIGTERM, assert exit within grace period.
- Run `tsc --noEmit` to confirm module-resolution types are consistent.
- Run `node --experimental-vm-modules` or `node --test` to confirm the test entry point works under the right module system.
- Run `node --trace-warnings` and `node --trace-uncaught` to surface hidden runtime defects.
- Inspect `package.json` `exports` against actual file paths with `node -e "console.log(require.resolve('./'))"`.
- Source references: https://nodejs.org/api/packages.html, https://nodejs.org/api/esm.html, https://nodejs.org/api/process.html, https://nodejs.org/api/worker_threads.html.
