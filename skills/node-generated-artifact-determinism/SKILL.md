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

same source/toolchain produces stable artifacts; timestamps, paths, random IDs, and environment data are excluded

- Source contracts remain authoritative over generated artifacts.
- Generated output must be reproducible and reviewable.
- Runtime validation remains distinct from compile-time typing.

## Implementation procedure

1. Pin tool/version.\n2. Normalize output.\n3. Remove volatile metadata.\n4. Regenerate in clean environment.\n5. Diff twice.\n6. Test reproducibility.

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
