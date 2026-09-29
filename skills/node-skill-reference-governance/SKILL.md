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

- References must point to authoritative HTTPS sources whenever an external contract is required.
- Prefer standards and first-party documentation over secondary summaries.
- Each reference should support a concrete decision; unused links are documentation noise.
- Broken or moved references are maintenance defects, not harmless prose drift.

## Implementation procedure

1. Identify external claims made by the skill.
2. Map each claim to an authoritative HTTPS reference.
3. Check reference reachability and scope.
4. Remove unsupported or redundant links.
5. Report reference gaps when external verification is required.

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
