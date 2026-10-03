---
name: node-skill-pack-format
description: Use when creating or reviewing the structure of an Agent Skills-compatible pack.
---

# Agent Skill Pack Format

## Purpose

maintaining portable SKILL.md folders that compatible coding agents can discover and load on demand.

## Activate when

- creating or reviewing the structure of an Agent Skills-compatible pack.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

each skill has a valid entrypoint and metadata; procedural content stays in the skill; supporting resources are optional and scoped

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Inspect the skill directory contract.
2. Validate frontmatter.
3. Keep names aligned with directories.
4. Separate discovery metadata from detailed instructions.
5. Verify progressive-disclosure assumptions.

## Failure modes

Avoid:

- inventing vendor-specific frontmatter as required standard; putting global policy into every skill; breaking folder/name alignment.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
