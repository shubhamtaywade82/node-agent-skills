---
name: node-filesystem-safety
description: Use when the service reads, writes, deletes, or serves files based on runtime input, or when file paths derive from users, tenants, archives, uploads, or external events.
license: MIT
---

# Filesystem Safety

## Purpose
Access local files from a Node.js backend without traversal, symlink, permission, or resource bugs. This skill is the single owning skill for filesystem safety in this pack; archive-specific traversal is owned by `node-archive-extraction-safety`, which composes with this skill.

## Activate when
- the service reads, writes, deletes, or serves files based on runtime input;
- file paths derive from users, tenants, archives, uploads, or external events;
- the change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection
1. Detect Node.js/TypeScript version, framework, package manager, database, deployment model, and test/build/CI commands.
2. Locate the authoritative implementation and existing safety/observability conventions.
3. Identify trust boundaries, resource ownership, and the allowed-root configuration.
4. Inspect configuration, deployment, and integration tests around the affected boundary.
5. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules
Filesystem paths are capabilities, not trusted strings. Canonicalization and authorization happen before access; writes are bounded and atomic where required.
- Prefer explicit policies and bounded resources over framework defaults.
- Canonicalize and constrain paths relative to a trusted root; resolve before checking containment.
- Never trust a normalized user path; reject escapes instead of sanitizing prefixes.
- Handle symlinks according to policy; do not follow symlinks across trust boundaries.
- Preserve security, data integrity, and public contracts.
- Make cleanup and rollback paths explicit.
- Separate runtime evidence from assumptions.

## Implementation procedure
1. Define the allowed root once, from configuration the server controls.
2. Resolve user-supplied paths relative to it with `path.resolve`.
3. Reject escapes: require the resolved path to remain inside the allowed root (compare against the resolved root, not a string prefix).
4. Handle symlinks according to policy: resolve real paths and re-check containment when symlinks can cross the boundary.
5. Enforce file size/count limits before and during writes (`fs.stat` before streaming, bounded streams).
6. Use safe permissions: least-privilege directories, never world-writable, never writable-plus-executable.
7. Use atomic write patterns (write to a temporary file in the same directory, then rename) where partial writes would corrupt state.
8. Test traversal, symlink races, and concurrent writes.

## Failure modes
Avoid:
- string-prefix path checks (`path.startsWith(root)` without `path.sep` and without prior `path.resolve`);
- joining a trusted root with an untrusted path without containment checks;
- following symlinks across trust boundaries;
- writable executable directories and world-writable files;
- partial writes and unbounded resource creation, logging, or network activity;
- security decisions based only on client-controlled metadata (filenames, MIME types, extensions);
- treating operational symptoms as proof of a single root cause;
- increasing limits or disabling controls without evidence.

## Verification
1. Add a failing regression/contract test first: traversal (`../`), absolute paths, encoded/percent-decoded segments, symlink escape.
2. Exercise boundary, concurrency, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates (`node --test test/*.test.mjs`, `node scripts/validate.mjs`).
4. Compare performance/diagnostic evidence before and after when the change touches a hot path.
5. Review the final diff, generated/configuration changes, and residual risk.
6. Report exactly what was verified and what remains unverified.
