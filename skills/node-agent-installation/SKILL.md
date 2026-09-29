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

- Installation must use a pinned repository revision or release artifact; never an arbitrary mutable branch.
- The manifest is the source of truth for what is installed; installation must not silently omit referenced skills.
- Installation commands are executed only after inspecting the target agent's local instructions and permissions.
- A successful copy is insufficient: discovery and validation must succeed in the target layout.

## Implementation procedure

1. Inspect the target agent format and repository-local instructions.
2. Pin the repository revision or release artifact.
3. Install the manifest closure without secrets or transient files.
4. Run discovery and repository validation.
5. Record the source revision and validation evidence.

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
