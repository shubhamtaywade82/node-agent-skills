---
name: node-file-system-safety
description: Use when file paths derive from users, tenants, archives, uploads, or external events.
---

# File System Safety

## Purpose

safe filesystem access in Node.js backends.

## Activate when

- file paths derive from users, tenants, archives, uploads, or external events.
- The change crosses a Node.js runtime, filesystem, telemetry, database, or HTTP protocol boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Inspect configuration, deployment, and integration tests around the affected boundary.
4. Confirm exact dependency/runtime versions before applying version-specific APIs.

## Decision rules

canonicalize and constrain paths; avoid following untrusted symlinks; use least-privilege directories

- Prefer measured behavior and platform primitives over speculative tuning.
- Keep resource, data, and telemetry exposure bounded.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Make cleanup and rollback paths explicit.

## Implementation procedure

1. Identify trusted root.
2. Resolve path.
3. Enforce containment.
4. Use safe flags.
5. Handle races.
6. Test traversal/symlink cases.

## Failure modes

Avoid:

- string-prefix path checks; trusting normalized user paths; writable executable directories.
- Treating operational symptoms as proof of a single root cause.
- Increasing limits or disabling controls without evidence.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, concurrency, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Compare performance/diagnostic evidence before and after.
5. Inspect the final diff for security and compatibility regressions.
