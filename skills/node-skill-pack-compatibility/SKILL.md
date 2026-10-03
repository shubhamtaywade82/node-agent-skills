---
name: node-skill-pack-compatibility
description: Use when the pack is intended for more than one agent runtime or editor integration.
---

# Agent Skill Pack Compatibility

## Purpose

keeping the skill pack portable across multiple compatible coding agents.

## Activate when

- the pack is intended for more than one agent runtime or editor integration.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

core SKILL.md content remains vendor-neutral; compatibility constraints are explicit; vendor-specific behavior is isolated

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Identify supported clients.
2. Avoid client-only commands in core skills.
3. Document compatibility requirements.
4. Test installation/discovery paths.
5. Keep optional integrations separate.

## Failure modes

Avoid:

- assuming every agent exposes identical tools; hard-coding one vendor's paths; making vendor behavior implicit.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
