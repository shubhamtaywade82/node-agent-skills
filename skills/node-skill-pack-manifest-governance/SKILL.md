---
name: node-skill-pack-manifest-governance
description: Use when a repository maintains a central skill manifest or registry.
---

# Skill Manifest Governance

## Purpose

keeping a machine-readable registry synchronized with the filesystem skill set.

## Activate when

- a repository maintains a central skill manifest or registry.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

registry is authoritative for routing metadata; every registered skill exists; duplicate IDs and stale entries fail validation

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Define manifest schema.
2. Validate names/categories/triggers.
3. Compare registry to directories.
4. Keep counts derived or contract-tested.
5. Review manifest changes like code.

## Failure modes

Avoid:

- editing registry without skill files; duplicate IDs; stale counts without tests.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
