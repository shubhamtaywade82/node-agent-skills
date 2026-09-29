---
name: node-skill-reference-governance
description: Use when skills link to other skills, references, docs, or adapters.
---

# Skill Reference Governance

## Purpose

managing cross-skill references so agents can reliably resolve related guidance.

## Activate when

- skills link to other skills, references, docs, or adapters.
- The change affects code generation, schema contracts, or agent-skill lifecycle.

## Repository inspection

1. Inspect source schemas, generators, manifests, lockfiles, and generated output.
2. Identify authoritative inputs and generated artifact ownership.
3. Inspect CI/release commands and consumer dependencies.
4. Confirm exact tool/runtime versions before applying generator-specific behavior.

## Decision rules

references are repository-relative or canonical; broken links are detected; references do not become hidden dependencies

- Source contracts remain authoritative over generated artifacts.
- Generated output must be reproducible and reviewable.
- Runtime validation remains distinct from compile-time typing.

## Implementation procedure

1. Inventory references.\n2. Normalize paths.\n3. Validate target existence.\n4. Detect cycles/obsolete targets.\n5. Test representative navigation.\n6. Document external sources.

## Failure modes

Avoid:

- stale relative paths; links to private files; hidden dependency chains; circular mandatory loading.
- Unversioned generation inputs or hidden environment dependencies.
- Manual edits to generated artifacts without an explicit ownership model.

## Verification

1. Add a failing contract/reproducibility test first.
2. Regenerate from a clean environment.
3. Compare generated artifacts and schema diffs.
4. Run the full repository gates.
5. Review the final diff for volatile or unintended output.
