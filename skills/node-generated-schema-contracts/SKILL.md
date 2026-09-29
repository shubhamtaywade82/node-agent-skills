---
name: node-generated-schema-contracts
description: Use when OpenAPI, JSON Schema, protobuf, GraphQL, or database schema generates code.
---

# Generated Schema Contracts

## Purpose

keeping generated TypeScript/runtime schemas aligned with authoritative API or data schemas.

## Activate when

- OpenAPI, JSON Schema, protobuf, GraphQL, or database schema generates code.
- The change affects code generation, schema contracts, or agent-skill lifecycle.

## Repository inspection

1. Inspect source schemas, generators, manifests, lockfiles, and generated output.
2. Identify authoritative inputs and generated artifact ownership.
3. Inspect CI/release commands and consumer dependencies.
4. Confirm exact tool/runtime versions before applying generator-specific behavior.

## Decision rules

schema is authoritative; generated types cannot be mistaken for runtime validation; breaking schema changes require compatibility checks

- Source contracts remain authoritative over generated artifacts.
- Generated output must be reproducible and reviewable.
- Runtime validation remains distinct from compile-time typing.

## Implementation procedure

1. Identify schema source.\n2. Validate schema.\n3. Generate artifacts.\n4. Compare contract diff.\n5. Pair compile-time types with runtime validation.\n6. Test consumers.

## Failure modes

Avoid:

- treating TypeScript types as runtime validation; changing generated types manually; shipping schema/code mismatch.
- Unversioned generation inputs or hidden environment dependencies.
- Manual edits to generated artifacts without an explicit ownership model.

## Verification

1. Add a failing contract/reproducibility test first.
2. Regenerate from a clean environment.
3. Compare generated artifacts and schema diffs.
4. Run the full repository gates.
5. Review the final diff for volatile or unintended output.
