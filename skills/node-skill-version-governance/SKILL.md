---
name: node-skill-version-governance
description: Use when a skill contract, routing rule, or adapter scope changes.
---

# Skill Version Governance

## Purpose

evolving a skill pack without silently changing agent behavior.

## Activate when

- a skill contract, routing rule, or adapter scope changes.
- The change affects code generation, schema contracts, or agent-skill lifecycle.

## Repository inspection

1. Inspect source schemas, generators, manifests, lockfiles, and generated output.
2. Identify authoritative inputs and generated artifact ownership.
3. Inspect CI/release commands and consumer dependencies.
4. Confirm exact tool/runtime versions before applying generator-specific behavior.

## Decision rules

breaking behavioral changes are identified and versioned; compatibility notes are explicit; old paths are removed only deliberately

- Source contracts remain authoritative over generated artifacts.
- Generated output must be reproducible and reviewable.
- Runtime validation remains distinct from compile-time typing.

## Implementation procedure

1. Classify change impact.\n2. Update version metadata.\n3. Add migration notes.\n4. Preserve aliases where justified.\n5. Add regression evals.\n6. Verify release artifact.

## Failure modes

Avoid:

- changing triggers or routing silently; claiming compatibility without testing; deleting a skill consumers still reference.
- Unversioned generation inputs or hidden environment dependencies.
- Manual edits to generated artifacts without an explicit ownership model.

## Verification

1. Add a failing contract/reproducibility test first.
2. Regenerate from a clean environment.
3. Compare generated artifacts and schema diffs.
4. Run the full repository gates.
5. Review the final diff for volatile or unintended output.
