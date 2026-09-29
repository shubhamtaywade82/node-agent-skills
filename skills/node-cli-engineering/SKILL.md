---
name: node-cli-engineering
description: Use when a backend repository adds or changes a CLI, migration command, worker command, or operational script.
---

# Node.js CLI Engineering

## Purpose

building production-grade Node.js command-line tools.

## Activate when

- a backend repository adds or changes a CLI, migration command, worker command, or operational script.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

stdout is machine-readable output when promised; stderr is diagnostics; exit codes encode outcome; signals and cancellation are handled; secrets never print

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define command contract.\n2. Parse and validate args/config.\n3. Separate output from diagnostics.\n4. Support non-TTY execution.\n5. Handle SIGINT/SIGTERM.\n6. Make retries/idempotency explicit.\n7. Test exit codes and failure output.

## Failure modes

Avoid:

- logging to stdout breaks pipes; hanging on stdin; treating SIGINT as success; leaking tokens in errors; non-deterministic prompts in CI.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
