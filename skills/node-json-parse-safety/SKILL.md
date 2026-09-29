---
name: node-json-parse-safety
description: Use when the backend parses JSON from HTTP, files, queues, or external integrations.
---

# JSON Parsing Safety

## Purpose

handling large, malformed, or adversarial JSON without uncontrolled memory or CPU use.

## Activate when

- the backend parses JSON from HTTP, files, queues, or external integrations.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

input size is bounded before parse where possible; parser failures are typed; deeply nested structures have a defined policy

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Set transport/body limits.\n2. Validate content type.\n3. Parse once.\n4. Reject malformed input consistently.\n5. Test oversized/deep payloads.\n6. Monitor parse failures.

## Failure modes

Avoid:

- parsing before body limits; swallowing syntax errors; recursive traversal without depth controls.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
