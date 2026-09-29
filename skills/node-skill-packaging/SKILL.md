---
name: node-skill-packaging
description: Use when a skill repository needs archives, packages, or reproducible release artifacts.
---

# Skill Pack Packaging

## Purpose

packaging a collection of coding-agent skills for release and redistribution.

## Activate when

- a skill repository needs archives, packages, or reproducible release artifacts.
- The work affects agent-skill packaging, discovery, routing, or measurement.

## Repository inspection

1. Inspect the skill tree, manifest, routing metadata, package/release files, and CI.
2. Detect the consumer format and any repository-local agent instructions.
3. Identify authoritative metadata and generated artifacts.
4. Confirm current version/format requirements before changing compatibility-sensitive files.

## Decision rules

- The source tree plus manifest is authoritative; package contents must be a complete, reproducible closure.
- Exclude credentials, .git state, caches, local machine metadata, and unrelated build artifacts.
- Package bytes should be stable across repeated builds from the same revision.
- Package verification must include unpacked discovery, manifest validation, and content integrity.

## Implementation procedure

1. Define the package inclusion closure from the manifest.
2. Exclude secrets and transient artifacts.
3. Build the package from the pinned revision.
4. Rebuild and compare content hashes.
5. Unpack and verify skill discovery and validation.

## Failure modes

Avoid:

- shipping .git data or secrets; package contents differing by machine; missing referenced files.
- Hidden vendor-specific behavior in the core contract.
- Unversioned release inputs.

## Verification

1. Add a failing contract or evaluation test first.
2. Exercise positive, negative, and ambiguous cases where relevant.
3. Run the full repository test and validation gates.
4. Verify packaged/discovered content matches the source contract.
5. Report exact evidence and unresolved compatibility risks.
