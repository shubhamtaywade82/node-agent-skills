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

the source tree is authoritative; packaged output is reproducible, complete, and free of transient files

- Source metadata remains authoritative.
- Keep discovery and routing deterministic and concise.
- Test behavioral contracts, not prose wording.

## Implementation procedure

1. Define included paths.\n2. Exclude secrets/cache/build artifacts.\n3. Generate package.\n4. Hash/verify contents.\n5. Test unpacked discovery.\n6. Record version.

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
