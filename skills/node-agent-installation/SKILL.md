---
name: node-agent-installation
description: Use when an agent or developer needs to bootstrap the pack into a supported local or CI environment.
---

# Agent Installation

## Purpose

installing this skill pack into a coding-agent environment reproducibly.

## Activate when

- an agent or developer needs to bootstrap the pack into a supported local or CI environment.
- The work affects agent-skill packaging, discovery, routing, or measurement.

## Repository inspection

1. Inspect the skill tree, manifest, routing metadata, package/release files, and CI.
2. Detect the consumer format and any repository-local agent instructions.
3. Identify authoritative metadata and generated artifacts.
4. Confirm current version/format requirements before changing compatibility-sensitive files.

## Decision rules

installation is versioned and reproducible; the agent discovers repository-local instructions before activating skills

- Source metadata remains authoritative.
- Keep discovery and routing deterministic and concise.
- Test behavioral contracts, not prose wording.

## Implementation procedure

1. Identify supported agent format.\n2. Pin repository revision.\n3. Install/copy skills.\n4. Verify manifest and validator.\n5. Record install source.\n6. Test discovery.

## Failure modes

Avoid:

- copying an arbitrary working tree; installing from an unpinned branch; skipping post-install validation.
- Hidden vendor-specific behavior in the core contract.
- Unversioned release inputs.

## Verification

1. Add a failing contract or evaluation test first.
2. Exercise positive, negative, and ambiguous cases where relevant.
3. Run the full repository test and validation gates.
4. Verify packaged/discovered content matches the source contract.
5. Report exact evidence and unresolved compatibility risks.
