---
name: node-skill-pack-release
description: Use when a new distributable pack version is prepared.
---

# Skill Pack Release

## Purpose

producing verified releases of the complete Node.js skill pack.

## Activate when

- a new distributable pack version is prepared.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

release artifacts come from a clean validated tree; manifest and files match; generated checksums are reproducible

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Freeze release source.
2. Run tests/validator.
3. Export pack.
4. Inspect manifest/checksums.
5. Create release metadata.
6. Record commit/version.
7. Verify clean consumer install.

## Failure modes

Avoid:

- releasing from unvalidated branch; mutable generated artifacts; missing source revision.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
