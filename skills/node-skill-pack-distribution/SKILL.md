---
name: node-skill-pack-distribution
description: Use when a pack needs to be copied or consumed outside its source repository.
---

# Skill Pack Distribution

## Purpose

publishing a complete filesystem distribution of skills, adapters, routing, and documentation.

## Activate when

- a pack needs to be copied or consumed outside its source repository.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

distribution contains only intended files; paths remain portable; metadata identifies version/source; integrity information is included

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Define payload allowlist.
2. Preserve relative paths.
3. Emit manifest metadata.
4. Generate checksums.
5. Avoid environment-specific files.
6. Verify output is self-contained.

## Failure modes

Avoid:

- shipping .git internals; environment-specific paths; incomplete adapter files; checksums over non-deterministic content.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
