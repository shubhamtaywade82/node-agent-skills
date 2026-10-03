---
name: node-skill-pack-versioning
description: Use when a pack release changes skills, routing, metadata, or adapters.
---

# Skill Pack Versioning

## Purpose

versioning the skill pack and documenting compatibility-affecting changes.

## Activate when

- a pack release changes skills, routing, metadata, or adapters.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

pack versions are intentional; breaking skill/routing changes are distinguishable from additive changes; consumers can identify the exact pack revision

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Define versioning policy.
2. Classify change impact.
3. Update changelog.
4. Tag/release from verified commit.
5. Preserve migration notes.
6. Validate version metadata.

## Failure modes

Avoid:

- bumping versions arbitrarily; changing routing incompatibly without notes; releases from dirty/unverified trees.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
