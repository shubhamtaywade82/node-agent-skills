---
name: node-filesystem-safety
description: Use when the service reads, writes, deletes, or serves files based on runtime input.
---

# Filesystem Safety

## Purpose

accessing local files from a Node.js backend without traversal, symlink, permission, or resource bugs.

## Activate when

- the service reads, writes, deletes, or serves files based on runtime input.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

filesystem paths are capabilities, not trusted strings; canonicalization and authorization happen before access; writes are bounded and atomic where required

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Define allowed root.\n2. Resolve user paths relative to it.\n3. Reject escapes.\n4. Handle symlinks according to policy.\n5. Enforce file size/count limits.\n6. Use safe permissions.\n7. Test traversal and concurrent writes.

## Failure modes

Avoid:

- joining root with untrusted paths without containment checks; following symlinks across trust boundaries; world-writable files; partial writes.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
