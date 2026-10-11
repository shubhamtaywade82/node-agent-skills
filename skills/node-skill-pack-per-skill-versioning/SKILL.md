---
name: node-skill-pack-per-skill-versioning
description: Use when versioning individual skills in node-agent-skills; tracks per-skill semver independent of the pack-level version.
---

# Node Skill Pack Per-Skill Versioning

## Purpose

Each skill in `skill-manifest.yml` carries its own `version` field independent of the pack-level `package.json` version. Consumers can pin a specific skill version without locking the whole pack; pack maintainers can bump a single skill's version when its contract changes.

## Activate when

- Changing the contract of a skill (frontmatter, sections, decision rules, verification).
- Adding a new skill to the manifest.
- Bumping pack version when multiple skills changed together.
- Running the changesets workflow to publish new versions.

## Repository inspection

1. `skill-manifest.yml` — every skill entry must have a `version` field (default `0.1.0`).
2. `package.json` — pack-level `version` reflects all skill versions combined.
3. `CHANGELOG.md` — entries per skill when bumped.
4. `.changeset/` — changeset files for in-progress bumps (added by contributors, consumed by the changesets workflow).
5. `.github/workflows/release.yml` — workflow that consumes changesets and creates a release PR.

## Decision rules

| Concern | Rule |
|---|---|
| Default version | `0.1.0` for new skills (initial development; API may change). |
| Major bump (1.0.0) | Renaming or removing the skill. Old version is permanently broken for consumers. |
| Minor bump (0.2.0) | Adding a new section, adding new decision rules, adding code samples. Backward compatible. |
| Patch bump (0.1.1) | Fixing typos, fixing the \\n escape bug, clarifying wording. Backward compatible, no behavior change. |
| Pre-1.0 | Any change can be breaking; document in CHANGELOG. |
| Pack version | Bumped via changesets when any skill version bumps. Pack version = max of all skill versions x pack release count. |
| Pinning | Consumers pin `skill@version` in their agent config; the loader returns only matching versions. |
| Compatibility | The loader's `get_skill(name)` returns the current version. Consumers can request a specific version via `get_skill(name, version)`. |

## Implementation procedure

1. Identify the skill being changed.
2. Classify the change: breaking (major), additive (minor), or fix (patch).
3. Run `npx changeset` to create a changeset file describing the bump.
4. Commit the changeset alongside the skill change.
5. The release workflow consumes changesets, bumps versions, and updates the CHANGELOG.
6. Tag the release commit.

## Failure modes

- Skill content changed without a version bump → consumers see silent behavior drift.
- Breaking change with only a patch bump → downstream consumers break.
- Changeset file describes one skill but commits another → release notes lie.
- Multiple changesets for the same skill in one release → only the highest bump applies.

## Verification

- Run `npm run changeset:check` — fails if any skill content changed without a changeset.
- Run `npm run changeset version` — bumps versions per changesets.
- Inspect `CHANGELOG.md` — entry per skill bump.
- Confirm `skill-manifest.yml` version field is consistent across the pack.
- Source references: https://github.com/changesets/changesets, https://semver.org/, https://keepachangelog.com/.
