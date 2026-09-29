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

- Evaluation cases must test observable behavior, not keyword presence alone.
- Include positive, negative, ambiguous, and failure-path pressure for each important routing decision.
- Never edit the contract or expected result merely to make a failing implementation appear green.
- Evaluation evidence must preserve the exact repository state and scenario inputs tested.

## Implementation procedure

1. Define the behavior or invariant being measured.
2. Add failing, negative, and ambiguous cases.
3. Apply repository-context and time-pressure conditions.
4. Record the expected evidence before implementation.
5. Run regression cases and inspect false-positive routing.

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
