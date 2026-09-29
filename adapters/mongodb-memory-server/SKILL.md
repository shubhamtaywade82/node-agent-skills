---
name: adapter-mongodb-memory-server
description: Use when the repository uses mongodb-memory-server.
---

# mongodb-memory-server adapter

## Purpose

Translate framework-neutral Node.js guidance into mongodb-memory-server-specific mechanics.

## Activate when

- mongodb-memory-server is present in the target repository.
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

1. Detect mongodb-memory-server and exact version.
2. Select the owning framework-neutral skill.
3. Apply mongodb-memory-server-specific APIs and lifecycle behavior.
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

https://github.com/typegoose/mongodb-memory-server

## Version scope

10.x.

## Adapter guidance

Use disposable MongoDB instances for integration tests when repository MongoDB behavior requires a real server. Pin versions when reproducibility matters, isolate databases per test worker, and never use the in-memory server as a production behavior substitute.
