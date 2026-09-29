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

- Generated clients are downstream artifacts of a versioned contract; the contract owns endpoint and type truth.
- Handwritten customization must live outside generated regions and survive regeneration.
- Generated auth, transport, and retry behavior must be reviewed explicitly.
- Regeneration must include client smoke tests against representative success and failure cases.

## Implementation procedure

1. Identify the source API/schema contract.
2. Determine generated versus handwritten ownership.
3. Regenerate with pinned tooling.
4. Review auth, transport, and retry behavior.
5. Run client smoke and compatibility tests.

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
