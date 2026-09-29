---
name: node-generated-artifact-determinism
description: Use when codegen output is committed, cached, or compared in CI.
---

# Generated Artifact Determinism

## Purpose

ensuring generated files are byte-stable across CI and developer environments.

## Activate when

- codegen output is committed, cached, or compared in CI.
- The change affects code generation, schema contracts, or agent-skill lifecycle.

## Repository inspection

1. Inspect source schemas, generators, manifests, lockfiles, and generated output.
2. Identify authoritative inputs and generated artifact ownership.
3. Inspect CI/release commands and consumer dependencies.
4. Confirm exact tool/runtime versions before applying generator-specific behavior.

## Decision rules

- Deterministic generation requires stable ordering, normalized environment inputs, and no volatile timestamps or machine-specific paths.
- The same inputs must produce byte-identical output where the artifact format permits it.
- Non-deterministic fields must be explicitly normalized or declared.
- Determinism failures block review until their source is explained.

## Implementation procedure

1. Enumerate generator inputs and environment variables.
2. Normalize ordering and volatile metadata.
3. Generate twice from equivalent clean environments.
4. Compare hashes and inspect any diff.
5. Gate release generation on deterministic output.

## Failure modes

Avoid:

- machine paths in generated code; timestamps in snapshots; generator using current working directory implicitly.
- Unversioned generation inputs or hidden environment dependencies.
- Manual edits to generated artifacts without an explicit ownership model.

## Verification

1. Add a failing contract/reproducibility test first.
2. Regenerate from a clean environment.
3. Compare generated artifacts and schema diffs.
4. Run the full repository gates.
5. Review the final diff for volatile or unintended output.
