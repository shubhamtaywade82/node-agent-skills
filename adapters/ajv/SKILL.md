---
name: adapter-ajv
description: Use when the repository uses Ajv.
---

# Ajv adapter

## Purpose

Translate framework-neutral Node.js guidance into Ajv-specific mechanics.

## Activate when

- Ajv is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, Node.js version, imports, and configuration.
2. Confirm the exact installed version.
3. Locate lifecycle, transaction, validation, or test-resource ownership.
4. Inspect adjacent tests and CI configuration.

## Decision rules

- Core skills remain authoritative for architecture, security, validation, and reliability.
- Detect the exact package version before using APIs.
- Keep external data validation explicit.
- Keep test resources disposable and isolated.

## Implementation procedure

1. Detect Ajv and exact version.
2. Select the owning framework-neutral skill.
3. Apply Ajv-specific APIs and lifecycle behavior.
4. Add focused regression/integration coverage.
5. Run repository-wide validation.

## Failure modes

- Copying incompatible version examples.
- Treating compile-time types as runtime validation.
- Leaking secrets or test resources.
- Hiding provider/database errors instead of classifying them.

## Verification

1. Run focused adapter tests.
2. Run the full test suite and build/typecheck gates.
3. Verify cleanup and failure behavior.
4. Review generated SQL/schema/security configuration where applicable.

## Source

https://ajv.js.org/

## Version scope

8.x.

## Adapter guidance

Compile JSON Schema validators deliberately; keep schemas versioned; configure strictness explicitly; do not enable unsafe coercion just to accept malformed input; validate external data before domain use; inspect generated validation errors without leaking sensitive payloads.
