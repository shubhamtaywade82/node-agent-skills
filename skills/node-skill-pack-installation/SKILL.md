---
name: node-skill-pack-installation
description: Use when a developer wants to use this pack from a local or user-level agent environment.
---

# Skill Pack Installation

## Purpose

installing or linking the pack into a compatible coding-agent skills directory.

## Activate when

- a developer wants to use this pack from a local or user-level agent environment.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

installation is explicit, reversible, and does not mutate unrelated projects; vendor lookup paths are documented separately from the portable skill format

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Choose project/user install target.
2. Copy or symlink safely.
3. Verify skill discovery.
4. Record installed revision.
5. Provide clean uninstall path.
6. Test on a disposable target.

## Failure modes

Avoid:

- copying into arbitrary directories; overwriting unrelated skills; assuming one vendor's lookup path.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
