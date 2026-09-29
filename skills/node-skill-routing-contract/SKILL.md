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

- Every routed task should have one primary owner unless ambiguity is intentional and explicitly represented.
- Secondary skills must correspond to actual dependencies or boundary effects, not broad topic similarity.
- Framework adapters load only after framework and version detection.
- When two primary candidates remain plausible, route to evidence gathering or escalate rather than guessing.

## Implementation procedure

1. Identify candidate skills from task evidence.
2. Select one primary owner using the routing matrix.
3. Add only evidence-backed secondary skills.
4. Detect framework/version before selecting adapters.
5. Test ambiguous and cross-boundary routing cases.

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
