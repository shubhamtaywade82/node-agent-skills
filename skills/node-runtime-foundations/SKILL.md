---
name: node-runtime-foundations
description: runtime
---

# Node Runtime Foundations

## Purpose
Use when Node.js runtime semantics, ESM/CommonJS modules, package exports, process lifecycle, signals, startup, shutdown, or event-loop behavior affects a backend change.

## Activate when
Treat runtime semantics as an explicit production contract.

## Repository inspection
- Changing module configuration.
- Changing startup or shutdown.
- Debugging event-loop or process behavior.

## Decision rules
Inspect package.json, package scope, tsconfig module settings, emitted output, runtime entrypoint, and container command.

## Implementation procedure
- Resolve module format from package metadata plus compiler configuration.
- Use Node-aware TypeScript module settings for modern Node applications.
- Startup ordering should be explicit.
- Graceful shutdown is a drain protocol.
- Keep blocking CPU/file work out of hot request paths.

## Failure modes
1. Establish the actual runtime contract.
2. Reproduce the behavior with build and run commands.
3. Change the smallest runtime boundary.
4. Add a runtime-visible regression test.
5. Verify startup, steady state, and termination.

## Verification
- Compile succeeds while Node fails resolution.
- Mixed ESM/CommonJS assumptions.
- SIGTERM truncates in-flight work.
- Forced exit loses cleanup or telemetry.

## Source foundation
Run build, typecheck, runtime smoke tests, and signal-driven shutdown tests when lifecycle changes.
