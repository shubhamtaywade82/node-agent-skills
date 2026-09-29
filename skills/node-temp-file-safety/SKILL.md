---
name: node-temp-file-safety
description: Use when backend workflows create temporary files or directories.
---

# Temporary File Safety

## Purpose

secure temporary-file creation and lifecycle.

## Activate when

- backend workflows create temporary files or directories.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

temporary names must be unguessable; permissions restrictive; cleanup is deterministic

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Use OS-safe temp APIs.
2. Restrict permissions.
3. Bound size/lifetime.
4. Cleanup on abort/error.
5. Avoid predictable names.

## Failure modes

Avoid:

- mktemp-style predictable paths; world-readable temp files; cleanup only on success.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
