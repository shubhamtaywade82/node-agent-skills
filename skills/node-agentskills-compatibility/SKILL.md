---
name: node-agentskills-compatibility
description: Use when skills are consumed by tools that implement the Agent Skills-style layout or metadata conventions.
---

# Agent Skills Compatibility

## Purpose

checking whether a repository follows the expected agent-skill file and metadata contract.

## Activate when

- skills are consumed by tools that implement the Agent Skills-style layout or metadata conventions.
- The work affects agent-skill packaging, discovery, routing, or measurement.

## Repository inspection

1. Inspect the skill tree, manifest, routing metadata, package/release files, and CI.
2. Detect the consumer format and any repository-local agent instructions.
3. Identify authoritative metadata and generated artifacts.
4. Confirm current version/format requirements before changing compatibility-sensitive files.

## Decision rules

- Compatibility is defined by the documented Agent Skills filesystem/frontmatter contract, not vendor folklore.
- Required metadata must remain portable; vendor-specific extensions belong in adapters or explicit compatibility layers.
- Unsupported metadata is rejected or ignored deterministically rather than changing routing semantics.
- Compatibility fixtures must include malformed, duplicate, and minimally valid skills.

## Implementation procedure

1. Identify the supported skill-file and metadata contract.
2. Compare the repository tree and frontmatter with that contract.
3. Exercise valid, invalid, duplicate, and unknown-metadata fixtures.
4. Verify discovery from a minimal consumer.
5. Record unsupported features as explicit compatibility risks.

## Failure modes

Avoid:

- vendor-specific hidden assumptions; unsupported metadata extensions; duplicate skill names.
- Hidden vendor-specific behavior in the core contract.
- Unversioned release inputs.

## Verification

1. Add a failing contract or evaluation test first.
2. Exercise positive, negative, and ambiguous cases where relevant.
3. Run the full repository test and validation gates.
4. Verify packaged/discovered content matches the source contract.
5. Report exact evidence and unresolved compatibility risks.
