---
name: node-vm-isolation-limitations
description: Use when a backend considers `node:vm` or similar primitives for executing dynamic code.
---

# VM Isolation Limitations

## Purpose

evaluating Node.js vm-based isolation claims for untrusted code.

## Activate when

- a backend considers `node:vm` or similar primitives for executing dynamic code.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

vm contexts are not treated as a complete security sandbox; hostile code requires process/container isolation and resource controls

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Classify code trust.\n2. State threat model.\n3. Prefer isolated processes/containers for hostile input.\n4. Bound CPU/memory/network.\n5. Test escape assumptions.\n6. Document limits.

## Failure modes

Avoid:

- calling vm a security boundary by default; exposing privileged objects; allowing network/filesystem access implicitly.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
