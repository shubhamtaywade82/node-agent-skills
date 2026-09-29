---
name: node-path-traversal-defense
description: Use when a request parameter selects a file, template, object, or local resource.
---

# Path Traversal Defense

## Purpose

preventing `../`, encoded, absolute, and separator-based traversal from crossing a configured resource root.

## Activate when

- a request parameter selects a file, template, object, or local resource.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

validation uses canonical filesystem semantics, not string prefix heuristics; decode/normalize only per the input protocol

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Decode input once where appropriate.\n2. Reject absolute paths.\n3. Resolve against allowed root.\n4. Compare canonical paths.\n5. Decide symlink policy.\n6. Test encoded traversal and platform separators.

## Failure modes

Avoid:

- startsWith(root) checks on non-canonical paths; double decoding; accepting Windows drive paths on cross-platform services.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
