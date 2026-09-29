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

- The canonical schema contract must have one authoritative source and explicit compatibility policy.
- Generated types must reflect the schema without silently widening or narrowing externally visible fields.
- Additive versus breaking schema changes require different rollout plans.
- Schema drift is detected by deterministic generation and contract comparison.

## Implementation procedure

1. Locate the canonical schema source.
2. Generate the derived types/artifacts.
3. Compare schema and generated contract diffs.
4. Classify compatibility impact.
5. Test consumers and the mixed-version boundary.

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
