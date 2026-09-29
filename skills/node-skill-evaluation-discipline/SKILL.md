---
name: node-skill-evaluation-discipline
description: Use when a new or modified skill needs evidence beyond structural validation.
---

# Skill Evaluation Discipline

## Purpose

designing behavioral evaluations that measure whether skills improve agent decisions.

## Activate when

- a new or modified skill needs evidence beyond structural validation.
- The work affects agent-skill packaging, discovery, routing, or measurement.

## Repository inspection

1. Inspect the skill tree, manifest, routing metadata, package/release files, and CI.
2. Detect the consumer format and any repository-local agent instructions.
3. Identify authoritative metadata and generated artifacts.
4. Confirm current version/format requirements before changing compatibility-sensitive files.

## Decision rules

evals test observable invariants and adversarial pressure; evaluation corpora are not weakened to make CI green

- Source metadata remains authoritative.
- Keep discovery and routing deterministic and concise.
- Test behavioral contracts, not prose wording.

## Implementation procedure

1. Define scenario.\n2. Add ambiguity/negative pressure.\n3. State expected invariants.\n4. Run baseline and candidate.\n5. Record regressions.

## Failure modes

Avoid:

- evaluating prose similarity; asserting implementation details; removing hard cases after failure.
- Hidden vendor-specific behavior in the core contract.
- Unversioned release inputs.

## Verification

1. Add a failing contract or evaluation test first.
2. Exercise positive, negative, and ambiguous cases where relevant.
3. Run the full repository test and validation gates.
4. Verify packaged/discovered content matches the source contract.
5. Report exact evidence and unresolved compatibility risks.
