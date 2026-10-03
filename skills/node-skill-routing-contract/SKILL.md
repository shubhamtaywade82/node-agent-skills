---
name: node-skill-routing-contract
description: Use when a task may match multiple skills and needs an owning primary skill.
---

# Skill Routing Contract

## Purpose

maintaining deterministic primary/secondary skill routing.

## Activate when

- a task may match multiple skills and needs an owning primary skill.
- The work affects agent-skill packaging, discovery, routing, or measurement.

## Repository inspection

1. Inspect the skill tree, manifest, routing metadata, package/release files, and CI.
2. Detect the consumer format and any repository-local agent instructions.
3. Identify authoritative metadata and generated artifacts.
4. Confirm current version/format requirements before changing compatibility-sensitive files.

## Decision rules

one primary owner is preferred; secondary skills represent real dependencies; routing stays framework-neutral

- Source metadata remains authoritative.
- Keep discovery and routing deterministic and concise.
- Test behavioral contracts, not prose wording.

## Implementation procedure

1. Define routing cases.\n2. Choose primary owner.\n3. Add bounded secondary set.\n4. Test ambiguous prompts.\n5. Detect orphan skills.

## Failure modes

Avoid:

- routing every task to many skills; duplicate primary ownership; framework-specific routing in core cases.
- Hidden vendor-specific behavior in the core contract.
- Unversioned release inputs.

## Verification

1. Add a failing contract or evaluation test first.
2. Exercise positive, negative, and ambiguous cases where relevant.
3. Run the full repository test and validation gates.
4. Verify packaged/discovered content matches the source contract.
5. Report exact evidence and unresolved compatibility risks.
