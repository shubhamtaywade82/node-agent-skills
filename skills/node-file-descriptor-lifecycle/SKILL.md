---
name: node-file-descriptor-lifecycle
description: Use when filesystem, sockets, watchers, or native resources are opened explicitly.
---

# File Descriptor Lifecycle

## Purpose

preventing leaked file descriptors and handles in long-lived Node.js processes.

## Activate when

- filesystem, sockets, watchers, or native resources are opened explicitly.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

every resource has an owner and close path; streams and abort/error paths release descriptors

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Map open/close lifecycle.\n2. Use async disposal where available.\n3. Close on abort/error.\n4. Bound concurrent opens.\n5. Instrument leaks.\n6. Test repeated failure paths.

## Failure modes

Avoid:

- closing only on success; retaining streams in caches forever; exceeding OS limits and masking it with retries.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
