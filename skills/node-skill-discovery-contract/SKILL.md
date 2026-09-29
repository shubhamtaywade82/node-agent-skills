---
name: node-skill-discovery-contract
description: Use when an agent must select skills from repository content without loading the entire pack.
---

# Skill Discovery Contract

## Purpose

designing predictable skill discovery and activation metadata.

## Activate when

- an agent must select skills from repository content without loading the entire pack.
- The work affects agent-skill packaging, discovery, routing, or measurement.

## Repository inspection

1. Inspect the skill tree, manifest, routing metadata, package/release files, and CI.
2. Detect the consumer format and any repository-local agent instructions.
3. Identify authoritative metadata and generated artifacts.
4. Confirm current version/format requirements before changing compatibility-sensitive files.

## Decision rules

- Discovery descriptions must express activation triggers and remain specific enough to reject unrelated tasks.
- A discovery hit is not sufficient for activation; repository evidence still decides applicability.
- Conflicting triggers require deterministic precedence or explicit ambiguity handling.
- Version-sensitive behavior belongs in adapters, not generic discovery metadata.

## Implementation procedure

1. Extract searchable trigger terms from each skill description.
2. Define positive and negative discovery examples.
3. Test collisions between similar skills.
4. Verify version-specific triggers remain adapter-scoped.
5. Record orphan, ambiguous, and over-broad descriptions.

## Failure modes

Avoid:

- generic descriptions; overlapping triggers without ownership; relying on filename guesses.
- Hidden vendor-specific behavior in the core contract.
- Unversioned release inputs.

## Verification

1. Add a failing contract or evaluation test first.
2. Exercise positive, negative, and ambiguous cases where relevant.
3. Run the full repository test and validation gates.
4. Verify packaged/discovered content matches the source contract.
5. Report exact evidence and unresolved compatibility risks.
