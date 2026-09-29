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

- Adapter activation requires detected installed versions to match explicit version_scope.
- Lockfiles and package manifests are stronger evidence than README version claims.
- Unsupported or ambiguous versions produce a safe no-adapter result rather than a guessed compatibility mode.
- Version-scope changes require fixtures for lower, target, and upper supported ranges.

## Implementation procedure

1. Detect installed package versions from manifests and lockfiles.
2. Resolve the adapter version_scope.
3. Test supported, unsupported, and ambiguous versions.
4. Update scope and compatibility fixtures together.
5. Record the source evidence for each supported range.

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
