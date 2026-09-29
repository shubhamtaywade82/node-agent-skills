---
name: node-regex-dos-defense
description: Use when user-controlled strings are matched by regular expressions.
---

# Regular Expression DoS Defense

## Purpose

preventing regular expressions from causing catastrophic backtracking or CPU exhaustion.

## Activate when

- user-controlled strings are matched by regular expressions.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

regex complexity and input length are bounded; untrusted patterns are disallowed or safely compiled

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Identify dynamic/static regexes.\n2. Inspect worst-case patterns.\n3. Bound input.\n4. Replace ambiguous patterns.\n5. Forbid user-provided regex where unnecessary.\n6. Fuzz adversarial inputs.

## Failure modes

Avoid:

- accepting arbitrary regex from users; nested quantifiers on large strings; relying on timeout after CPU is already consumed.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
