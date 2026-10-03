---
name: node-skill-pack-source-governance
description: Use when an adapter or reference depends on external documentation.
---

# Skill Source Governance

## Purpose

tracking authoritative sources and version scope for technology-specific guidance.

## Activate when

- an adapter or reference depends on external documentation.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

sources are explicit, primary where possible, and version-scoped; stale sources are detectable

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Record source URL.
2. Record version scope.
3. Separate stable concepts from version-specific APIs.
4. Review currentness before release.
5. Flag unsupported versions.

## Failure modes

Avoid:

- copying unverified examples; vague 'latest' claims without detection; stale vendor links.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
