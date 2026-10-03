---
name: node-skill-pack-routing-governance
description: Use when an agent must choose relevant skills from a large pack.
---

# Skill Routing Governance

## Purpose

designing deterministic primary/secondary skill routing for AI coding tasks.

## Activate when

- an agent must choose relevant skills from a large pack.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

one dominant boundary has one primary owner; secondary skills are justified by actual dependencies; routing must not load every skill

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Define routing cues.
2. Choose primary boundary.
3. Add dependent skills only when necessary.
4. Test ambiguous cases.
5. Inspect for unreachable/duplicate routes.

## Failure modes

Avoid:

- keyword-only routing; loading entire pack; contradictory owners; routes pointing to deleted skills.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
