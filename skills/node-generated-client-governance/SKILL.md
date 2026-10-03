---
name: node-generated-client-governance
description: Use when an external API client is generated from a schema.
---

# Generated Client Governance

## Purpose

maintaining generated API clients without hiding transport, auth, retry, or compatibility behavior.

## Activate when

- an external API client is generated from a schema.
- The change affects code generation, schema contracts, or agent-skill lifecycle.

## Repository inspection

1. Inspect source schemas, generators, manifests, lockfiles, and generated output.
2. Identify authoritative inputs and generated artifact ownership.
3. Inspect CI/release commands and consumer dependencies.
4. Confirm exact tool/runtime versions before applying generator-specific behavior.

## Decision rules

generated transport stays replaceable; auth/timeout/retry policy remains explicit; regeneration is reproducible

- Source contracts remain authoritative over generated artifacts.
- Generated output must be reproducible and reviewable.
- Runtime validation remains distinct from compile-time typing.

## Implementation procedure

1. Define generator/source.\n2. Isolate generated output.\n3. Wrap with small domain client.\n4. Document retry/auth behavior.\n5. Regenerate in CI.\n6. Test contract failures.

## Failure modes

Avoid:

- embedding secrets in generated code; editing generated transport directly; assuming generated retries are safe.
- Unversioned generation inputs or hidden environment dependencies.
- Manual edits to generated artifacts without an explicit ownership model.

## Verification

1. Add a failing contract/reproducibility test first.
2. Regenerate from a clean environment.
3. Compare generated artifacts and schema diffs.
4. Run the full repository gates.
5. Review the final diff for volatile or unintended output.
