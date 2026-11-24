---
name: node-skill-packaging
description: Use when authoring, structuring, or releasing a skill pack — Agent Skills file format, SKILL.md frontmatter and progressive disclosure, source governance, and reproducible release artifacts.
---

# Skill Pack Packaging

## Purpose

Turn a source tree of coding-agent skills into a structurally valid, vendor-neutral, reproducibly versioned pack. The source tree is authoritative; every packaged artifact is a derived output that must be reconstructible byte-for-byte. Format, sources, and release are one discipline: a pack whose structure drifts from the Agent Skills format, whose claims cite no sources, or whose release artifacts cannot be re-generated is not shippable.

## Activate when

- Creating or reviewing the structure of an Agent Skills-compatible pack (SKILL.md files, YAML frontmatter, progressive disclosure).
- Preparing a new distributable pack version (changeset → Release PR → versioned artifact).
- An adapter or reference depends on external documentation and the source/version scope must be explicit.
- Packaged output diverges between machines or a package is missing referenced files.

## Boundary with related skills

- Use `node-skill-pack-installation` for installing/linking the pack into agent environments and multi-runtime compatibility.
- Use `node-skill-pack-manifest-governance` for the central registry, routing metadata, and versioning rules.
- Use `node-change-log-integrity` for release notes and changelog discipline.
- Use `node-generated-artifact-determinism` when the pack includes generated output.

## Repository inspection

1. Inspect the skill tree, manifest, routing metadata, package/release files, and CI.
2. Check every SKILL.md against the format contract: required frontmatter (`name`, `description`), body readable without the frontmatter loaded, progressive disclosure respected (metadata first, details on demand).
3. Find every external source an adapter or reference depends on; check its version scope is recorded.
4. Identify the release path: changesets config, Release PR flow, export script, artifact hashing.

## Decision rules

| Concern | Rule |
|---|---|
| Format | Every skill is a directory with a SKILL.md whose frontmatter `name` matches the directory and whose description states when to use it. |
| Progressive disclosure | Frontmatter carries routing metadata; the body carries depth. Routing must work from metadata alone. |
| Source governance | External documentation is never embedded as authoritative without a recorded source URL and version scope. |
| Authoritative source | The source tree is authoritative; packaged output is reproducible, complete, and free of transient files. |
| Release gate | A release artifact is produced only after the repository's complete validation gate passes. |
| Version | Every release is a versioned, hashed artifact; unversioned release inputs fail the gate. |

## Implementation procedure

1. Define included paths; exclude secrets, cache, build artifacts, and `.git` data.
2. Validate each skill file against the format contract before packaging (frontmatter match, description present, no vendor-specific assumptions in the core contract).
3. Record source URLs and version scope for every external documentation dependency.
4. Generate the package with a deterministic script (`npm run pack:export`); hash/verify contents.
5. Version via changesets: write a changeset for behavior changes, let the Release PR consume it, tag from the versioned commit.
6. Test unpacked discovery on a disposable target; record the version and checksum.

## Failure modes

- Shipping `.git` data, secrets, or machine-specific transient files inside the package.
- Package contents differing by machine or run — a non-deterministic export script.
- A referenced file missing from the archive — the pack unpacks but skills fail discovery.
- Frontmatter `name` drifting from the directory name — the loader resolves the wrong skill or refuses to load.
- An adapter citing external docs with no recorded version scope — docs change and the guidance silently rots.
- Releasing content that has not passed the repository's complete validation gate.
- Vendor-specific behavior leaking into the portable core contract.

## Verification

1. Add a failing contract or evaluation test first; exercise positive, negative, and ambiguous cases.
2. Build the package twice on the same commit — outputs must be byte-identical.
3. Unpack on a disposable target: discovery resolves every skill, no missing references.
4. Verify frontmatter/name consistency across the whole pack (loader contract test).
5. Confirm the artifact carries version + checksum metadata and matches the source contract; run `npm run validate` and `npm test`.
