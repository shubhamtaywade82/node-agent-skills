---
name: node-runtime-foundations
description: Use when Node.js runtime semantics, ESM/CommonJS modules, package exports, process lifecycle, signals, startup, shutdown, or event-loop behavior affects a backend change.
---

# Node Runtime Foundations

## Purpose
Treat runtime semantics as an explicit production contract.

## Activate when
Change module configuration, startup/shutdown, signal handling, or investigate event-loop/process behavior.

## Repository inspection
Inspect package.json, package scope, tsconfig module settings, emitted output, runtime entrypoint, and container command.

## Decision rules
Resolve module format from package metadata plus compiler settings. Startup ordering must be explicit. Graceful shutdown is a drain protocol. Avoid blocking work in hot request paths.

## Implementation procedure
1. Establish runtime contract. 2. Reproduce with build/run commands. 3. Change the smallest boundary. 4. Add runtime regression test. 5. Verify startup, steady state, termination.

## Failure modes
Compile succeeds while Node fails resolution; mixed ESM/CJS assumptions; SIGTERM truncates work; forced exit loses cleanup or telemetry.

## Verification
Run build, typecheck, runtime smoke tests, and signal-driven shutdown tests when lifecycle changes.

## Source foundation
https://www.typescriptlang.org/tsconfig/module
