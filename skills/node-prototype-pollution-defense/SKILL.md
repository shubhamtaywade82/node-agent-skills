---
name: node-prototype-pollution-defense
description: Use when the backend merges, clones, parses, or maps untrusted object data.
---

# Prototype Pollution Defense

## Purpose

preventing attacker-controlled keys from altering object prototypes or application behavior.

## Activate when

- the backend merges, clones, parses, or maps untrusted object data.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

prototype-sensitive operations are minimized; input schemas reject dangerous keys where relevant; object dictionaries use safe representations

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Identify merge/clone boundaries.\n2. Validate keys.\n3. Use null-prototype maps where appropriate.\n4. Avoid unsafe deep merge.\n5. Test __proto__/constructor/prototype payloads.\n6. Inspect dependency behavior.

## Failure modes

Avoid:

- recursive merge of arbitrary objects; assuming JSON parsing alone is safe; using object prototype inheritance for attacker-controlled dictionaries.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
